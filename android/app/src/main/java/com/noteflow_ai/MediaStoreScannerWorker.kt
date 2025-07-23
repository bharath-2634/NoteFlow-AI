package com.noteflow_ai

import android.content.Context
import android.content.SharedPreferences
import android.net.Uri
import android.provider.MediaStore
import android.util.Log
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import androidx.work.ListenableWorker.Result
import androidx.work.OneTimeWorkRequestBuilder // ADD THIS IMPORT
import androidx.work.WorkManager // ADD THIS IMPORT
import androidx.work.workDataOf // ADD THIS IMPORT
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.*
import java.util.concurrent.TimeUnit // ADD THIS IMPORT for initialDelay

class MediaStoreScannerWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    private val TAG = "MediaStoreScanner"
    private val PREF_NAME = "ScannedDocsPrefs"
    private val PREF_KEY = "scanned_doc_uris"

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "MediaStoreScannerWorker started execution.")

            val prefs = applicationContext.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
            val scannedUris = prefs.getStringSet(PREF_KEY, emptySet())?.toMutableSet() ?: mutableSetOf()

            val newDocsToClassify = mutableListOf<Uri>() // List to hold new URIs for classification
            val currentUrisInMediaStore = mutableSetOf<String>() // To update SharedPreferences accurately

            val projection = arrayOf(
                MediaStore.Files.FileColumns._ID,
                MediaStore.Files.FileColumns.DISPLAY_NAME,
                MediaStore.Files.FileColumns.MIME_TYPE,
                MediaStore.Files.FileColumns.DATE_MODIFIED // Add DATE_MODIFIED for future proofing
            )

            // Expanded selectionArgs for common document types
            val selection = "${MediaStore.Files.FileColumns.MIME_TYPE} IN (?, ?, ?, ?, ?, ?, ?, ?)"
            val selectionArgs = arrayOf(
                "application/pdf",
                "application/msword",       // .doc
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
                "text/plain",               // .txt
                "application/vnd.ms-powerpoint", // .ppt
                "application/vnd.openxmlformats-officedocument.presentationml.presentation" // .pptx
            )

            val sortOrder = "${MediaStore.Files.FileColumns.DATE_ADDED} DESC" // Sort by most recent first

            val uri = MediaStore.Files.getContentUri("external")

            val cursor = applicationContext.contentResolver.query(uri, projection, selection, selectionArgs, sortOrder)

            cursor?.use {
                val idColumn = it.getColumnIndexOrThrow(MediaStore.Files.FileColumns._ID)
                val displayNameColumn = it.getColumnIndexOrThrow(MediaStore.Files.FileColumns.DISPLAY_NAME)
                val mimeTypeColumn = it.getColumnIndexOrThrow(MediaStore.Files.FileColumns.MIME_TYPE)
                val dateModifiedColumn = it.getColumnIndexOrThrow(MediaStore.Files.FileColumns.DATE_MODIFIED) // Get date modified

                Log.d(TAG, "Started Scanning.")

                while (it.moveToNext()) {
                    val id = it.getLong(idColumn)
                    val displayName = it.getString(displayNameColumn)
                    val mimeType = it.getString(mimeTypeColumn)
                    val dateModified = it.getLong(dateModifiedColumn)

                    val docUri = Uri.withAppendedPath(uri, id.toString())
                    val docUriString = docUri.toString()

                    currentUrisInMediaStore.add(docUriString) // Add to the set for next scan's comparison

                    // Check if this URI was not in the previously scanned set
                    // For re-classification on modification, you'd need to store (URI, timestamp) tuples
                    Log.d(TAG,"Scanned URI's ${scannedUris}")
                    if (!scannedUris.contains(docUriString)) {
                        newDocsToClassify.add(docUri)
                        Log.d(TAG, "New document detected: $displayName (URI: $docUriString, Mime: $mimeType, Modified: $dateModified)")
                    }
                }

                Log.d(TAG, "End of Scanning")
            }

            Log.d(TAG, "Out of My Scanning ${newDocsToClassify}")
            // Enqueue classification tasks for new documents
            if (newDocsToClassify.isNotEmpty()) {
                Log.i(TAG, "Found ${newDocsToClassify.size} new documents. Scheduling classification.")
                for (docUri in newDocsToClassify) {
                    val classificationWorkRequest = OneTimeWorkRequestBuilder<FileClassificationWorker>()
                        .setInputData(workDataOf("fileUri" to docUri.toString()))
                        .setInitialDelay(5, TimeUnit.SECONDS) // Small delay to allow MediaStore to fully write
                        .build()
                    WorkManager.getInstance(applicationContext).enqueue(classificationWorkRequest)
                }
            } else {
                Log.d(TAG, "No new documents found in MediaStore.")
            }

            // Save the *current* set of URIs for the next scan
            prefs.edit().putStringSet(PREF_KEY, currentUrisInMediaStore).apply()

            Log.d(TAG, "MediaStore scan complete.")
            Result.success()

        } catch (e: Exception) {
            Log.e(TAG, "Error scanning MediaStore: ${e.message}", e)
            Result.failure()
        }
    }
}