package com.noteflow_ai

import android.os.Build
import android.provider.MediaStore
import android.webkit.MimeTypeMap
import android.content.Context
import android.media.MediaScannerConnection
import android.os.Environment
import android.util.Log
import androidx.work.Worker
import androidx.work.WorkerParameters
import java.io.File
import android.net.Uri
import androidx.documentfile.provider.DocumentFile
import androidx.work.Data
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.CoroutineWorker
import com.noteflow_ai.AppDatabase
import com.noteflow_ai.ClassifiedDocumentDao


fun scanForNewFiles(context: Context, directory: File) {
    directory.listFiles()?.forEach { file ->
        val extension = file.extension.lowercase()
        if (file.isFile && extension in listOf("pdf", "docx", "pptx", "txt")) {
            MediaScannerConnection.scanFile(
                context,
                arrayOf(file.absolutePath),
                null
            ) { path, uri ->
                Log.d("MediaScanner", "Scanned $path => $uri")
            }
        }
    }
}

class SimpleLoggerWorker(
    context: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    val context = applicationContext

    private val TAG = "SimpleLoggerWorker"
    private val validExtensions = listOf("pdf", "docx", "pptx", "txt")

    private fun getPdfList(context: Context): ArrayList<String> {
        val pdfList = ArrayList<String>()
        val collection: Uri = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            MediaStore.Files.getContentUri(MediaStore.VOLUME_EXTERNAL)
        } else {
            MediaStore.Files.getContentUri("external")
        }
        val projection = arrayOf(
            MediaStore.Files.FileColumns.DISPLAY_NAME,
            MediaStore.Files.FileColumns.DATA,
            MediaStore.Files.FileColumns.MIME_TYPE
        )
        val sortOrder = MediaStore.Files.FileColumns.DATE_ADDED + " DESC"
        val selection = MediaStore.Files.FileColumns.MIME_TYPE + " = ?"
        val mimeType = MimeTypeMap.getSingleton().getMimeTypeFromExtension("pdf")
        val selectionArgs = arrayOf(mimeType)

        val cursor = applicationContext.contentResolver.query(
            collection, projection, selection, selectionArgs, sortOrder
        )

        cursor?.use {
            val columnData = it.getColumnIndex(MediaStore.Files.FileColumns.DATA)
            val columnName = it.getColumnIndex(MediaStore.Files.FileColumns.DISPLAY_NAME)
            while (it.moveToNext()) {
                pdfList.add(it.getString(columnData))
                Log.d(TAG, "getPdf: " + it.getString(columnData))
            }
        }

        return pdfList
    }

    val newDocsToClassify = mutableListOf<Uri>()

    override suspend fun doWork(): Result {
        

        val currentTime = System.currentTimeMillis()
        Log.d(TAG, "🕒 Worker started at: $currentTime")

        val sharedPreferences = applicationContext.getSharedPreferences("MyAppPrefs", Context.MODE_PRIVATE)
        val safPrefs = applicationContext.getSharedPreferences("saf_prefs", Context.MODE_PRIVATE)
        val lastCheckTime = sharedPreferences.getLong("lastCheckTimestamp", 0)

        // Traditional directories
        val downloadPath = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
        val whatsappDocsPath = File("/storage/emulated/0/Android/media/com.whatsapp/WhatsApp/Media/WhatsApp Documents")
        val legacyWhatsAppDocsPath = File("/storage/emulated/0/WhatsApp/Media/WhatsApp Documents")

        val directories = mutableListOf<File>()

        // Add traditional paths
        directories.add(downloadPath)
        directories.add(whatsappDocsPath)
        directories.add(legacyWhatsAppDocsPath)

        // Add path from manual sharedPreferences (if any)
        val manualPath = sharedPreferences.getString("manualDownloads", null)
        manualPath?.let {
            val manualDir = File(it)
            if (manualDir.exists()) directories.add(manualDir)
            
        }

        // Add custom SAF directory (persisted Uri path)
        // Step 3: Read SAF-selected folder (custom SAF URI)
        val customUriPath = safPrefs.getString("customDirPath", null)
        customUriPath?.let {
            val customUri = Uri.parse(it)
            val documentFile = DocumentFile.fromTreeUri(applicationContext, customUri)

            documentFile?.listFiles()?.forEach { file ->
                val name = file.name ?: return@forEach
                val extension = name.substringAfterLast('.', "").lowercase()

                if (file.isFile && extension in validExtensions) {
                    Log.d(TAG, "✅ SAF Match: ${file.name} | Uri: ${file.uri}")
                    newDocsToClassify.add(file.uri)
                } else {
                    Log.d(TAG, "⛔ Ignored SAF file: ${file.name}")
                }
            }
        }

        // Traverse and log matching files
        directories.forEach { dir ->
            if (dir.exists() && dir.isDirectory) {
                dir.listFiles()?.forEach { file ->
                    val extension = file.extension.lowercase()
                    Log.d(TAG, "📂 Found file: ${file.name} | Modified: ${file.lastModified()}")

                    if (file.isFile && extension in validExtensions) {
                        Log.d(TAG, "✅ New/Updated Document: ${file.name} | Path: ${file.absolutePath}")
                        val fileUri = Uri.fromFile(file) 
                        newDocsToClassify.add(fileUri)
                    }
                }
                // Scan for MediaStore update
                scanForNewFiles(applicationContext, dir)
            } else {
                Log.w(TAG, "⚠️ Directory not found or inaccessible: ${dir.absolutePath}")
            }
        }

        val pdfPaths = getPdfList(context)
        pdfPaths.forEach {
            Log.d(TAG, "📄 PDF via MediaStore: $it")
            val file = File(it)
            if (file.exists()) {
                val uri = Uri.fromFile(file)
                newDocsToClassify.add(uri)
            }
        }

        Log.d(TAG, "🧠 Total new documents to classify: ${newDocsToClassify.size}")

        val db = AppDatabase.getInstance(applicationContext)
        val dao = db.documentDao()

        val sharedPrefs = applicationContext.getSharedPreferences("user_prefs", Context.MODE_PRIVATE)
        val currentUserId = sharedPrefs.getString("current_user_id", null)

        Log.d(TAG,"CurrentUserId ${currentUserId}")
      
        for (uri in newDocsToClassify) {

            val fileName = DocumentFile.fromSingleUri(applicationContext, uri)?.name ?: "unknown.pdf"
            val uriString = uri.toString()
            
            val existing = dao.getDocumentByUri(uriString)
            //if(existing!=null) {
                //Log.d(TAG,"Existing File ${existing.status}")
            //}
            
            if (existing == null || existing.status == "pending" || existing.status == "failed") {
                
                if(existing == null) {
                    val document = ClassifiedDocument(
                        uri = uriString,
                        fileName = fileName,
                        classification = null,
                        documentId = null,
                        status = "pending",
                        timestamp = System.currentTimeMillis()
                    )
                    dao.insert(document)
                }
                
                
                val inputData = Data.Builder()
                    .putString("uri", uriString)
                    .putString("user_id", currentUserId)
                    .build()

                val workRequest = OneTimeWorkRequestBuilder<FileClassificationWorker>()
                    .setInputData(inputData)
                    .build()

                WorkManager.getInstance(applicationContext).enqueue(workRequest)
            }
        }


        sharedPreferences.edit().putLong("lastCheckTimestamp", currentTime).apply()

        return Result.success()
    }
}