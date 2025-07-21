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
) : Worker(context, workerParams) {

    private val TAG = "SimpleLoggerWorker"
    private val validExtensions = listOf("pdf", "docx", "pptx", "txt")

    private fun getPdfList(): ArrayList<String> {
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

    override fun doWork(): Result {
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
                    // You can trigger notifications, indexing, etc. here
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
                        // Optional: You can trigger a notification or callback here
                    }
                }
                // Scan for MediaStore update
                scanForNewFiles(applicationContext, dir)
            } else {
                Log.w(TAG, "⚠️ Directory not found or inaccessible: ${dir.absolutePath}")
            }
        }

        val pdfPaths = getPdfList()
        pdfPaths.forEach {
            Log.d(TAG, "📄 PDF via MediaStore: $it")
        }

        sharedPreferences.edit().putLong("lastCheckTimestamp", currentTime).apply()

        return Result.success()
    }
}
