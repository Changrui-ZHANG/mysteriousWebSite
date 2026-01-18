package com.changrui.mysterious.domain.media.model;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Résultat d'un upload de média
 */
public class MediaUploadResult {
    
    @JsonProperty("url")
    private String url;
    
    @JsonProperty("filename")
    private String filename;
    
    @JsonProperty("size")
    private long size;
    
    @JsonProperty("mimeType")
    private String mimeType;
    
    @JsonProperty("width")
    private Integer width;
    
    @JsonProperty("height")
    private Integer height;
    
    // Constructeurs
    public MediaUploadResult() {}
    
    public MediaUploadResult(String url, String filename, long size, String mimeType) {
        this.url = url;
        this.filename = filename;
        this.size = size;
        this.mimeType = mimeType;
    }
    
    public MediaUploadResult(String url, String filename, long size, String mimeType, Integer width, Integer height) {
        this.url = url;
        this.filename = filename;
        this.size = size;
        this.mimeType = mimeType;
        this.width = width;
        this.height = height;
    }
    
    // Getters et Setters
    public String getUrl() {
        return url;
    }
    
    public void setUrl(String url) {
        this.url = url;
    }
    
    public String getFilename() {
        return filename;
    }
    
    public void setFilename(String filename) {
        this.filename = filename;
    }
    
    public long getSize() {
        return size;
    }
    
    public void setSize(long size) {
        this.size = size;
    }
    
    public String getMimeType() {
        return mimeType;
    }
    
    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }
    
    public Integer getWidth() {
        return width;
    }
    
    public void setWidth(Integer width) {
        this.width = width;
    }
    
    public Integer getHeight() {
        return height;
    }
    
    public void setHeight(Integer height) {
        this.height = height;
    }
}