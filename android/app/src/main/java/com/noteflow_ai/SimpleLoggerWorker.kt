package com.noteflow_ai

import android.content.Context
import android.os.Environment
import android.util.Log
import androidx.work.Worker
import androidx.work.WorkerParameters
import java.io.File
import android.media.MediaScannerConnection

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

    override fun doWork(): Result {
        val currentTime = System.currentTimeMillis()
        Log.d(TAG, "🕒 Worker started at: $currentTime")

        val sharedPreferences = applicationContext.getSharedPreferences("MyAppPrefs", Context.MODE_PRIVATE)
        val lastCheckTime = sharedPreferences.getLong("lastCheckTimestamp", 0)

        val downloadPath = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
        val whatsappMediaRoot = File("/storage/emulated/0/Android/media/com.whatsapp/WhatsApp/Media")
        val whatsappDocsPath = File("/storage/emulated/0/Android/media/com.whatsapp/WhatsApp/Media/WhatsApp Documents")
        
        scanForNewFiles(applicationContext, whatsappDocsPath)

        val directories = listOf(downloadPath, whatsappDocsPath, File("/storage/emulated/0/WhatsApp/Media/WhatsApp Documents"))
    
        directories.forEach { dir ->
            if (dir.exists() && dir.isDirectory) {
                dir.listFiles()?.forEach { file ->
                    val extension = file.extension.lowercase()
                    Log.d(TAG, "🔍 Found file: ${file.name} | LastModified: ${file.lastModified()}")

                    if (file.isFile && extension in validExtensions && file.lastModified() > lastCheckTime) {
                        Log.d(TAG, "✅ New/Updated Document: ${file.name} | Path: ${file.absolutePath}")
                        // You can also send a notification or do something with the file here
                    }
                }
            } else {
                Log.w(TAG, "⚠️ Directory not found or inaccessible: ${dir.absolutePath}")
            }
        }

        sharedPreferences.edit().putLong("lastCheckTimestamp", currentTime).apply()
        return Result.success()
    }
}
