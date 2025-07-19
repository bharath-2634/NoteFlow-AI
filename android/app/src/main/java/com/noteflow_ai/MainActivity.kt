// MainActivity.kt
package com.noteflow_ai

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import android.app.DownloadManager
import android.content.Context
import android.net.Uri
import android.os.Environment
import android.widget.Button
import com.noteflow_ai.WhatsAppFileObserver


class MainActivity : ReactActivity() {
    private var observer: WhatsAppFileObserver? = null

    override fun getMainComponentName(): String = "NoteFlow_AI"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val request = DownloadManager.Request(Uri.parse("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"))
            .setTitle("Dummy PDF")
            .setDescription("Testing DownloadManager")
            .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
            .setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, "dummy.pdf")

        val manager = getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
        manager.enqueue(request)

        // whatsapp triggerring
        val whatsappDocsPath = "/storage/emulated/0/Android/media/com.whatsapp/WhatsApp/Media/WhatsApp Documents"
        observer = WhatsAppFileObserver(whatsappDocsPath) { file ->
            // ✅ Here you can directly call your classification worker
            Log.d("Observer", "Processing new file: ${file.name}")

            // Example: Enqueue worker
            //FileClassificationWorker.enqueue(applicationContext, file.absolutePath)
        }
        observer?.startWatching()

    }
}
