package com.changrui.mysterious.shared.util;

import java.awt.Dimension;
import java.io.IOException;
import java.io.InputStream;
import java.util.Iterator;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;

/**
 * Image helpers that inspect headers without decoding pixel data.
 */
public final class ImageUtils {

    static {
        // Make sure plugins packaged in the app jar (e.g. TwelveMonkeys WebP) are registered
        ImageIO.scanForPlugins();
    }

    private ImageUtils() {
    }

    /**
     * Read image dimensions from the header only (no full decode, so huge images can't exhaust memory).
     *
     * @return the dimensions, or null if no ImageIO reader recognizes the data
     * @throws IOException if the header is recognized but unreadable
     */
    public static Dimension readDimensions(InputStream input) throws IOException {
        try (ImageInputStream iis = ImageIO.createImageInputStream(input)) {
            if (iis == null) {
                return null;
            }
            Iterator<ImageReader> readers = ImageIO.getImageReaders(iis);
            if (!readers.hasNext()) {
                return null;
            }
            ImageReader reader = readers.next();
            try {
                reader.setInput(iis, true, true);
                return new Dimension(reader.getWidth(0), reader.getHeight(0));
            } finally {
                reader.dispose();
            }
        }
    }
}
