package com.noteflow_ai

import android.content.Context
import android.util.Log
import androidx.work.Worker
import androidx.work.WorkerParameters
import java.io.File

class SimpleLoggerWorker(
    context: Context,
    workerParams: WorkerParameters
) : Worker(context, workerParams) {

    private val TAG = "SimpleLoggerWorker"
    private val validExtensions = listOf("pdf", "docx", "pptx", "txt") // <- Step 1

    override fun doWork(): Result {
        val currentTime = System.currentTimeMillis()
        Log.d(TAG, "🕒 Worker started at: $currentTime")

        val sharedPreferences = applicationContext.getSharedPreferences("MyAppPrefs", Context.MODE_PRIVATE)
        val lastCheckTime = sharedPreferences.getLong("lastCheckTimestamp", 0)

        val downloadDir = File("/storage/emulated/0/Download")
        val whatsappDocsDir = File("/storage/emulated/0/Android/media/com.whatsapp/WhatsApp/Media/WhatsApp Documents")

        val filesToCheck = listOf(downloadDir, whatsappDocsDir)
        

        for (dir in filesToCheck) {
            if (dir.exists() && dir.isDirectory) {
                dir.listFiles()?.forEach { file ->
                    Log.d(TAG, "Checking file: ${file.name}")
                    if (file.isFile && file.lastModified() > lastCheckTime) {
                        val extension = file.extension.lowercase()
                        if (extension in validExtensions) {
                            Log.d(TAG, "📄 New or updated document: ${file.name} | Path: ${file.absolutePath}")
                        }
                    }
                }
            } else {
                Log.w(TAG, "⚠️ Directory not found or inaccessible: ${dir.absolutePath}")
            }
        }

        // Update last check timestamp
        sharedPreferences.edit().putLong("lastCheckTimestamp", currentTime).apply()

        return Result.success()
    }
}
