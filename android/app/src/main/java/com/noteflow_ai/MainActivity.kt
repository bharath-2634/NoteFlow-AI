package com.noteflow_ai // Ensure this matches your actual package name

import android.app.DownloadManager // ADD THIS IMPORT
import android.content.Context // ADD THIS IMPORT
import android.net.Uri // ADD THIS IMPORT
import android.os.Bundle // ADD THIS IMPORT for onCreate
import android.os.Environment // ADD THIS IMPORT
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import android.util.Log // ADD THIS IMPORT for logging

class MainActivity : ReactActivity() {

    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    override fun getMainComponentName(): String = "NoteFlow_AI"

    /**
     * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
     * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
     */
    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    // IMPORTANT: Move the DownloadManager logic into the onCreate method
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState) // Always call super.onCreate() first

        // --- DownloadManager Test Logic (for testing your BroadcastReceiver) ---
        // In a real app, this would be triggered by a user action (e.g., button press)
        // or specific app logic, not every time the activity is created.
        try {
            val downloadManager = getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
            val uri = Uri.parse("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf")
            val request = DownloadManager.Request(uri)
                .setTitle("Test PDF")
                .setDescription("Downloading test PDF for NoteFlow AI")
                .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                // Using getExternalFilesDir ensures your app has permission to write here
                // without needing WRITE_EXTERNAL_STORAGE on Android 10+
                .setDestinationInExternalFilesDir(this, Environment.DIRECTORY_DOWNLOADS, "test_noteflow_ai_document.pdf")

            val downloadId = downloadManager.enqueue(request)
            Log.d("MainActivity", "Test PDF download started with ID: $downloadId")
        } catch (e: Exception) {
            Log.e("MainActivity", "Error starting test download: ${e.message}", e)
        }
        // --- End DownloadManager Test Logic ---
    }
}