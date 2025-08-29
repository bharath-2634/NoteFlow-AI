package com.noteflow_ai

import android.content.Context
import android.net.Uri
import android.util.Log
import androidx.documentfile.provider.DocumentFile
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException
import java.util.concurrent.TimeUnit

class FileClassificationWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    private val TAG = "ClassificationWorker"
    
    private val API_BASE_URL = "https://ca221342b518.ngrok-free.app"
    // private val USER_ID = "6863b27fdc31892b932ab086"

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
    val userId = inputData.getString("user_id")
    val uriString = inputData.getString("uri")

    if (userId.isNullOrBlank() || uriString.isNullOrBlank()) {
        Log.e(TAG, "❌ Missing user_id or uri in InputData")
        return@withContext Result.failure()
    }

    val db = AppDatabase.getInstance(applicationContext)
    val dao = db.documentDao()

    val doc = dao.getDocumentByUri(uriString)
    if (doc == null) {
        Log.e(TAG, "❌ No document found in DB for URI: $uriString")
        return@withContext Result.failure()
    }

    Log.d(TAG, "📂 Starting classification for ${doc.fileName}")

    val uri = Uri.parse(uriString)
    val fileBytes = readFileBytesFromUri(applicationContext, uri)

    if (fileBytes.isNullOrEmpty()) {
        Log.e(TAG, "❌ Failed to read bytes for ${doc.fileName}")
        dao.update(doc.copy(status = "failed"))
        return@withContext Result.failure()
    }

    val success = classifyAndUpdate(doc, fileBytes, dao, userId)
    if (!success) {
        dao.update(doc.copy(status = "failed"))
        return@withContext Result.retry()
    }

    Result.success()
}


    private suspend fun classifyAndUpdate(
        doc: ClassifiedDocument,
        fileBytes: ByteArray,
        dao: ClassifiedDocumentDao,
        userId: String
    ): Boolean {
        Log.d(TAG,"Entering into request body")
        val client = OkHttpClient.Builder()
            .connectTimeout(120, TimeUnit.SECONDS)
            .readTimeout(120, TimeUnit.SECONDS)
            .writeTimeout(120, TimeUnit.SECONDS)
            .build()
        
        val requestBody = MultipartBody.Builder().setType(MultipartBody.FORM)
            .addFormDataPart("user_id", userId)
            .addFormDataPart("file", doc.fileName, fileBytes.toRequestBody("application/octet-stream".toMediaTypeOrNull()))
            .build()
        Log.d(TAG,"Request Body ${requestBody}")
        val request = Request.Builder()
            .url("$API_BASE_URL/classify")
            .post(requestBody)
            .build()
        Log.d(TAG,"After calling the API")
        return try {
            val response = client.newCall(request).execute()
            Log.d(TAG,"Response from API ${response}")
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                Log.d(TAG, "✅ Response: $responseBody")

                val classification = extractLabelFromResponse(responseBody)
                val documentId = extractDocumentId(responseBody)

                dao.update(
                    doc.copy(
                        classification = classification,
                        documentId = documentId,
                        status = "classified"
                    )
                )

                true
            } else {
                Log.e(TAG, "API error: ${response.code} ${response.message}")
                false
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Classification failed: ${e.message}", e)
            false
        }
    }

    private fun readFileBytesFromUri(context: Context, uri: Uri): ByteArray? {
        return try {
            context.contentResolver.openInputStream(uri)?.use { it.readBytes() } // line 111
        } catch (e: Exception) {
            Log.e(TAG, "❌ Failed to read bytes from $uri", e)
            null
        }
    }

    private fun extractLabelFromResponse(responseBody: String?): String? {
        return try {
            val json = JSONObject(responseBody ?: "")
            json.optString("label", null)
        } catch (e: Exception) {
            Log.e("ParseError", "Failed to extract label: ${e.message}", e)
            null
        }
    }

    private fun extractDocumentId(responseBody: String?): String? {
        return try {
            val json = JSONObject(responseBody ?: "")
            json.optString("document_id", null)
        } catch (e: Exception) {
            Log.e("ParseError", "Failed to extract documentId: ${e.message}", e)
            null
        }
    }
}
