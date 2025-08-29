package com.noteflow_ai

import android.os.Build
import android.provider.MediaStore
import android.webkit.MimeTypeMap
import android.content.Context
import android.media.MediaScannerConnection
import android.os.Environment
import android.util.Log
import androidx.work.*
import java.io.File
import android.net.Uri
import androidx.documentfile.provider.DocumentFile

class SimpleLoggerWorker(
    context: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    private val TAG = "SimpleLoggerWorker"
    private val validExtensions = listOf("pdf", "docx", "pptx", "txt")

    override suspend fun doWork(): Result {
        val currentTime = System.currentTimeMillis()
        Log.d(TAG, "🕒 Worker started at: $currentTime")

        val sharedPreferences = applicationContext.getSharedPreferences("MyAppPrefs", Context.MODE_PRIVATE)
        val safPrefs = applicationContext.getSharedPreferences("saf_prefs", Context.MODE_PRIVATE)
        val lastCheckTime = sharedPreferences.getLong("lastCheckTimestamp", 0)

        val db = AppDatabase.getInstance(applicationContext)
        val dao = db.documentDao()

        val sharedPrefs = applicationContext.getSharedPreferences("user_prefs", Context.MODE_PRIVATE)
        val currentUserId = sharedPrefs.getString("current_user_id", null)

        if (currentUserId == null) {
            Log.e(TAG, "❌ No user_id found, skipping scan")
            return Result.failure()
        }

        // Collect new files incrementally
        val newUris = mutableListOf<Uri>()

        // === Step 1: Add from downloads & WhatsApp ===
        val directories = listOf(
            Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS),
            File("/storage/emulated/0/Android/media/com.whatsapp/WhatsApp/Media/WhatsApp Documents"),
            File("/storage/emulated/0/WhatsApp/Media/WhatsApp Documents")
        )

        directories.forEach { dir ->
            if (dir.exists() && dir.isDirectory) {
                dir.listFiles()?.forEach { file ->
                    val ext = file.extension.lowercase()
                    if (file.isFile && ext in validExtensions) {
                        val uri = Uri.fromFile(file)
                        newUris.add(uri)
                    }
                }
            }
        }

        // === Step 2: Add from SAF (user-picked folder) ===
        safPrefs.getString("customDirPath", null)?.let { path ->
            val customUri = Uri.parse(path)
            val docFile = DocumentFile.fromTreeUri(applicationContext, customUri)
            docFile?.listFiles()?.forEach { file ->
                val ext = file.name?.substringAfterLast('.', "")?.lowercase()
                if (file.isFile && ext in validExtensions) {
                    newUris.add(file.uri)
                }
            }
        }

        // === Step 3: Add from MediaStore PDFs ===
        val pdfMime = MimeTypeMap.getSingleton().getMimeTypeFromExtension("pdf")
        val cursor = applicationContext.contentResolver.query(
            MediaStore.Files.getContentUri(MediaStore.VOLUME_EXTERNAL),
            arrayOf(MediaStore.Files.FileColumns.DATA),
            "${MediaStore.Files.FileColumns.MIME_TYPE}=?",
            arrayOf(pdfMime),
            MediaStore.Files.FileColumns.DATE_ADDED + " DESC"
        )

        cursor?.use {
            val columnData = it.getColumnIndex(MediaStore.Files.FileColumns.DATA)
            while (it.moveToNext()) {
                val path = it.getString(columnData)
                val file = File(path)
                if (file.exists()) newUris.add(Uri.fromFile(file))
            }
        }

        Log.d(TAG, "🧠 Found total ${newUris.size} new docs to check")

        // === Step 4: Deduplicate against DB + batch insert ===
        val pendingDocs = mutableListOf<Uri>()
        for (uri in newUris) {
            val uriStr = uri.toString()
            val existing = dao.getDocumentByUri(uriStr)

            if (existing == null || existing.status == "pending" || existing.status == "failed") {
                pendingDocs.add(uri)
            }
        }

        if (pendingDocs.isEmpty()) {
            Log.d(TAG, "✅ No new pending docs")
            return Result.success()
        }

        // === Step 5: Process in batches (e.g., 20 per run) ===
        val batchSize = 10
        val batch = pendingDocs.take(batchSize)

        for (uri in batch) {
            val uriStr = uri.toString()
            val fileName = DocumentFile.fromSingleUri(applicationContext, uri)?.name ?: "unknown"
            dao.insert(
                ClassifiedDocument(
                    uri = uriStr,
                    fileName = fileName,
                    classification = null,
                    documentId = null,
                    status = "pending",
                    timestamp = System.currentTimeMillis()
                )
            )

            val inputData = Data.Builder()
                .putString("user_id", currentUserId)
                .putString("uri", uriStr)
                .build()

            val workRequest = OneTimeWorkRequestBuilder<FileClassificationWorker>()
                .setInputData(inputData)
                .build()

            WorkManager.getInstance(applicationContext).enqueue(workRequest)
        }

        
        // Mark timestamp
        sharedPreferences.edit().putLong("lastCheckTimestamp", currentTime).apply()

        return Result.success()
    }
}
