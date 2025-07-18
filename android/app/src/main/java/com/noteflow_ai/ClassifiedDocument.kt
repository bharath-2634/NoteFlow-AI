package com.noteflow_ai

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "classified_documents")
data class ClassifiedDocument(
    @PrimaryKey val uri: String,
    val fileName: String,
    val classification: String?,
    val documentId: String?,     
    val status: String,         
    val timestamp: Long          
)
