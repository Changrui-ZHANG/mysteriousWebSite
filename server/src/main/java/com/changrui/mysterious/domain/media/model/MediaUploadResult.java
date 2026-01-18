package com.changrui.mysterious.domain.media.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Résultat d'un upload de média
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
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

    public MediaUploadResult(String url, String filename, long size, String mimeType) {
        this.url = url;
        this.filename = filename;
        this.size = size;
        this.mimeType = mimeType;
    }
}