package com.noteflow_ai

import android.os.FileObserver
import android.util.Log
import java.io.File

class WhatsAppFileObserver(
    private val folderPath: String,
    private val onFileCreated: (file: File) -> Unit
) : FileObserver(folderPath, CREATE or MOVED_TO) {

    override fun onEvent(event: Int, path: String?) {
        if (path != null) {
            val fullPath = "$folderPath/$path"
            val file = File(fullPath)

            if (file.exists() && file.isFile) {
                Log.d("WhatsAppObserver", "New file detected: $file")
                onFileCreated(file)
            }
        }
    }
}
