package com.noteflow_ai

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "classified_documents")
data class ClassifiedDocument(
    @PrimaryKey val uri: String,
    val fileName: String,
    val classification: String?, // Nullable String? ✅ OK
    val documentId: String?,     // Nullable String? ✅ OK
    val status: String,          // ✅ Non-nullable
    val timestamp: Long          // ✅ Primitive long
)
