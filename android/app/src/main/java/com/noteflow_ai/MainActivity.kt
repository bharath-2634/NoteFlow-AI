package com.noteflow_ai

import androidx.documentfile.provider.DocumentFile
import android.content.Context
import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.DocumentsContract
import android.util.Log
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate



class MainActivity : ReactActivity() {

    companion object {
        const val REQUEST_CODE_OPEN_DIRECTORY = 42
    }

    override fun getMainComponentName(): String = "NoteFlow_AI"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // SAF: Trigger directory picker for WhatsApp Documents
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT_TREE).apply {
            putExtra(
                DocumentsContract.EXTRA_INITIAL_URI,
                Uri.parse("content://com.android.externalstorage.documents/document/primary:WhatsApp%2FMedia%2FWhatsApp%20Documents")
            )
        }
        startActivityForResult(intent, REQUEST_CODE_OPEN_DIRECTORY)
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == REQUEST_CODE_OPEN_DIRECTORY && resultCode == Activity.RESULT_OK) {
            data?.data?.let { treeUri ->
                // Persist access permissions
                contentResolver.takePersistableUriPermission(
                    treeUri,
                    Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                )

                // Log for debug
                Log.d("SAF", "Got tree URI: $treeUri")

                // You can now access DocumentFile tree
                val pickedDir = DocumentFile.fromTreeUri(this, treeUri)
                pickedDir?.listFiles()?.forEach { file: DocumentFile ->
                    Log.d("SAF", "File in WhatsApp Documents: ${file.name}")
                }

                val prefs = getSharedPreferences("saf_prefs", Context.MODE_PRIVATE)
                prefs.edit().putString("whatsapp_uri", treeUri.toString()).apply()

            }
        }
    }
}

