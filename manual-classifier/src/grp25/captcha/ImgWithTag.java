package grp25.captcha;

import grp25.captcha.tag.Binary;
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

class ImgWithTag {
    private File img;
    private ArrayList<Tag> ts;
    private int rows;
    private int cols;
    public BufferedImage[] bis;

    ImgWithTag(File img, int rows, int cols) throws IOException {
        this.img = img;
        this.rows = rows;
        this.cols = cols;
        this.ts = new ArrayList<>(Collections.nCopies(rows * cols, Binary.getDefault())); // TODO: change to generic type!!!
        BufferedImage bi = ImageIO.read(img);
        int w = bi.getWidth() / cols;
        int h = bi.getHeight() / rows;
        bis = new BufferedImage[cols*rows];
        int num = 0;
        for(int y = 0; y + h - 1 < bi.getHeight(); y += h) {
            for(int x = 0; x + w - 1 < bi.getWidth(); x += w) {
                bis[num] = bi.getSubimage(x, y, w, h);
                num ++;
            }
        }
    }

    BufferedImage getPitch(int row, int col) {
        checkIndexError(row, col);
        return bis[row * cols + col];
    }

    Tag getTag(int row, int col) {
        checkIndexError(row, col);
        return ts.get(row * cols + col);
    }

    void setTag(int row, int col, Tag t) {
        checkIndexError(row, col);
        ts.set(row * cols + col, t);
    }

    String getType () throws IOException {
        return Files.probeContentType(img.toPath()).split("/")[1];
    }

    public File getImg() {
        return img;
    }

    private void checkIndexError(int row, int col) {
        if (row < 0 || row >= rows || col < 0 || col >= cols) {
            String info ="Can not find tag in row " + row + " col " + col +
                    "in a grid of row " + rows + " col " + cols+".";
            throw  new IndexOutOfBoundsException(info);
        }
    }
    public void setAll(boolean hab) {
        this.ts = new ArrayList<>(Collections.nCopies(rows * cols,
                hab ? HABITABLE : NON_HABITABLE
        )); // TODO: change to generic type!!!
    }
}
