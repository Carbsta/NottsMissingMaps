package grp25.captcha;

import grp25.captcha.tag.Tag;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.Collections;

import static grp25.captcha.tag.Binary.HABITABLE;
import static grp25.captcha.tag.Binary.NON_HABITABLE;

/**
 * A wrapper class for a image and its patches with tags.
 */
class ImgWithTag {
    /**
     * The buffer of image patches generated from {@link #img}.
     */
    private BufferedImage[] bis;
    /**
     * The source image.
     */
    private File img;
    private ArrayList<Tag> ts;
    private int rows;
    private int cols;

    /**
     * A wrapper class for a image and its patches with tags.
     *
     * @param img  The source Image
     * @param rows The number of rows that the image will be sliced into
     * @param cols The number of cols that the image will be sliced into
     * @param hab  The default value of whether each patches are habitable or not.
     *             This argument should be generalize to general
     *             {@link grp25.captcha.tag.Tag} value.
     * @throws IOException The exception be raised when reading images from the file system
     */
    ImgWithTag(File img, int rows, int cols, boolean hab) throws IOException {
        this.img = img;
        this.rows = rows;
        this.cols = cols;
        this.ts = new ArrayList<>(Collections.nCopies(rows * cols, hab ? HABITABLE : NON_HABITABLE)); // TODO: change to generic type!!!
        BufferedImage bi = ImageIO.read(img);
        int w = bi.getWidth() / cols;
        int h = bi.getHeight() / rows;
        bis = new BufferedImage[cols * rows];
        int num = 0;
        for (int y = 0; y + h - 1 < bi.getHeight(); y += h) {
            for (int x = 0; x + w - 1 < bi.getWidth(); x += w) {
                bis[num] = bi.getSubimage(x, y, w, h);
                num++;
            }
        }
    }

    /**
     * Get the BufferedImage of patch of the given coordinate.
     *
     * @param row The row coordinate (y).
     * @param col The col coordinate (x).
     * @return The BufferedImage of patch of the given coordinate.
     */
    BufferedImage getPatch(int row, int col) {
        checkIndexError(row, col);
        return bis[row * cols + col];
    }

    /**
     * Get the tag of patch given its row and column index.
     * @param row The row index of patch.
     * @param col The column index of patch.
     * @return The tag of given row and column.
     */
    Tag getTag(int row, int col) {
        checkIndexError(row, col);
        return ts.get(row * cols + col);
    }

    /**
     * Set the tag of the given patch to given value.
     * @param row The row index of patch to set.
     * @param col The column index of patch to set
     * @param t The tag that the patch to set to.
     */
    void setTag(int row, int col, Tag t) {
        checkIndexError(row, col);
        ts.set(row * cols + col, t);
    }

    /**
     * Get the file extension of source image file
     *
     * @return The file extension of source image file.
     * @exception IOException IO excption generated from operations about file.
     */
    String getType() throws IOException {
        return Files.probeContentType(img.toPath()).split("/")[1];
    }

    /**
     * Get the source image file.
     *
     * @return The source image file.
     */
    public File getImg() {
        return img;
    }

    /**
     * @param row The row index to check
     * @param col The column index to check
     * @throws IndexOutOfBoundsException Thrown if the index is out of boundary.
     */
    private void checkIndexError(int row, int col) throws IndexOutOfBoundsException {
        if (row < 0 || row >= rows || col < 0 || col >= cols) {
            String info = "Can not find tag in row " + row + " col " + col +
                    "in a grid of row " + rows + " col " + cols + ".";
            throw new IndexOutOfBoundsException(info);
        }
    }

    /**
     * Set all patches to given tag. This function should be generalize so that
     * it can work with any {@link grp25.captcha.tag.Tag}.
     *
     * @param hab Whether all patches are inhabitable.
     */
    public void setAll(boolean hab) {
        this.ts = new ArrayList<>(Collections.nCopies(rows * cols,
                hab ? HABITABLE : NON_HABITABLE
        )); // TODO: change to generic type!!!
    }
}
