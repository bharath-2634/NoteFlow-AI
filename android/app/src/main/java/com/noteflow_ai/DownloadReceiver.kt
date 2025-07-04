package com.noteflow_ai // Ensure this matches your actual package name (e.g., com.noteflow_ai)

import android.app.DownloadManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log // Make sure Log is imported
import androidx.work.OneTimeWorkRequestBuilder // Essential WorkManager import
import androidx.work.WorkManager // Essential WorkManager import
import androidx.work.workDataOf // Kotlin extension for Data creation

class DownloadReceiver : BroadcastReceiver() {
    private val TAG = "DownloadReceiver" // Added TAG for consistent logging

    override fun onReceive(context: Context, intent: Intent) {
        if (DownloadManager.ACTION_DOWNLOAD_COMPLETE == intent.action) {
            val downloadId = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1)
            Log.d(TAG, "Download complete. ID: $downloadId")

            // Schedule work
            val workRequest = OneTimeWorkRequestBuilder<FileClassificationWorker>()
                .setInputData(workDataOf("downloadId" to downloadId)) // Use workDataOf for Data object
                .build()

            WorkManager.getInstance(context).enqueue(workRequest)
            Log.d(TAG, "WorkManager task scheduled for download ID: $downloadId")
        }
    }
}