package com.noteflow_ai // Ensure this matches your actual package name (e.g., com.noteflow_ai)

import android.app.DownloadManager
import android.content.Context
import android.database.Cursor
import android.net.Uri
import android.util.Log
import androidx.work.CoroutineWorker // Essential WorkManager import for suspend functions
import androidx.work.WorkerParameters // Essential WorkManager import
import androidx.work.ListenableWorker.Result // Correct Result type for Worker/CoroutineWorker
import kotlinx.coroutines.Dispatchers // For coroutine dispatchers
import kotlinx.coroutines.withContext // For switching coroutine context
import okhttp3.MediaType.Companion.toMediaTypeOrNull // OkHttp extension for MediaType
import okhttp3.MultipartBody // OkHttp for multipart requests
import okhttp3.OkHttpClient // OkHttp HTTP client
import okhttp3.RequestBody.Companion.toRequestBody // OkHttp extension for RequestBody
import okhttp3.Request // OkHttp HTTP request
import okhttp3.Response // OkHttp HTTP response
import java.io.File
import java.io.IOException
import java.util.concurrent.TimeUnit // For OkHttpClient timeouts

// FileClassificationWorker must extend CoroutineWorker for suspend functions
class FileClassificationWorker(appContext: Context, workerParams: WorkerParameters)
    : CoroutineWorker(appContext, workerParams) {

    private val TAG = "ClassificationWorker"
    // IMPORTANT: Replace with your actual FastAPI server IP/domain
    private val API_BASE_URL = "https://noteflow-ai-classification-model.onrender.com"
    // IMPORTANT: Replace with a valid user ID (e.g., from your MongoDB)
    private val USER_ID = "6863b27fdc31892b932ab086"

    // doWork must be a suspend function for CoroutineWorker
    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        val downloadId = inputData.getLong("downloadId", -1) // inputData is a property of CoroutineWorker

        val dm = applicationContext.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager // applicationContext is a property
        val query = DownloadManager.Query().setFilterById(downloadId)
        val cursor: Cursor? = dm.query(query) // Cursor can be null

        if (cursor == null || !cursor.moveToFirst()) {
            Log.e(TAG, "No download found with ID $downloadId or cursor is null/empty.")
            cursor?.close() // Close cursor if it's not null but empty
            return@withContext Result.failure()
        }

        val uriString = cursor.getString(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_LOCAL_URI))
        cursor.close() // Always close the cursor

        val fileUri = Uri.parse(uriString)
        Log.d(TAG, "Attempting to classify file from URI: $fileUri")

        // --- Read file bytes from URI (most reliable way for content URIs) ---
        val fileBytes = readFileBytesFromUri(applicationContext, fileUri)
        val fileName = getFileNameFromUri(applicationContext, fileUri) ?: "unknown_file"

        if (fileBytes == null || fileBytes.isEmpty()) {
            Log.e(TAG, "Failed to read file bytes from URI: $fileUri. Cannot classify.")
            return@withContext Result.failure()
        }

        // 🧠 Call your API with file bytes
        return@withContext classifyDocument(fileBytes, fileName)
    }

    // Function to classify document using its bytes and filename
    private suspend fun classifyDocument(fileBytes: ByteArray, fileName: String): Result {
        val client = OkHttpClient.Builder()
            .connectTimeout(120, TimeUnit.SECONDS) // Added timeouts
            .readTimeout(120, TimeUnit.SECONDS)
            .writeTimeout(120, TimeUnit.SECONDS)
            .build()

        val requestBody = MultipartBody.Builder().setType(MultipartBody.FORM)
            .addFormDataPart("user_id", USER_ID)
            .addFormDataPart("file", fileName, fileBytes.toRequestBody("application/octet-stream".toMediaTypeOrNull()))
            .build()

        val request = Request.Builder()
            .url("$API_BASE_URL/classify") // Use your actual endpoint
            .post(requestBody)
            .build()

        return try {
            val response = client.newCall(request).execute() // Synchronous execution within CoroutineWorker's IO dispatcher

            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                Log.d(TAG, "API success: ${response.code}. Response: $responseBody")
                // TODO: Parse response for classification category and document_id
                // TODO: Show notification here (e.g., using NotificationManager)
                // TODO: Move file here (requires SAF DocumentFile API and user-granted URI)
                Result.success()
            } else {
                val errorBody = response.body?.string()
                Log.e(TAG, "API error: ${response.code} - ${response.message}. Body: $errorBody")
                Result.failure()
            }
        } catch (e: IOException) {
            Log.e(TAG, "API call failed: ${e.message}", e)
            Result.failure()
        } catch (e: Exception) {
            Log.e(TAG, "An unexpected error occurred during API call: ${e.message}", e)
            Result.failure()
        }
    }

    // Helper function to read file bytes from a content URI
    private fun readFileBytesFromUri(context: Context, uri: Uri): ByteArray? {
        return try {
            context.contentResolver.openInputStream(uri)?.use { inputStream ->
                inputStream.readBytes()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error reading file bytes from URI: $uri", e)
            null
        }
    }

    // Helper function to get filename from a content URI
    private fun getFileNameFromUri(context: Context, uri: Uri): String? {
        var fileName: String? = null
        if (uri.scheme == "content") {
            val cursor = context.contentResolver.query(uri, null, null, null, null)
            cursor?.use {
                if (it.moveToFirst()) {
                    val nameIndex = it.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME)
                    if (nameIndex != -1) {
                        fileName = it.getString(nameIndex)
                    }
                }
            }
        }
        if (fileName == null) {
            fileName = uri.lastPathSegment // Fallback to last path segment
        }
        return fileName
    }

    // TODO: Implement robust file moving logic using SAF DocumentFile API
    // This is a complex task that needs to be done carefully to handle
    // permissions and different storage providers.
    // You'll need the URI of the target "NoteFlow AI Classified" folder (user-selected via SAF)
    // and then use DocumentFile.fromTreeUri() to navigate and create subfolders/move files.
}