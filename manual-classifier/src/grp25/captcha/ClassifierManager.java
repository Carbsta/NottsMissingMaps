package grp25.captcha;

import grp25.captcha.tag.Binary;
import javafx.beans.property.BooleanProperty;
import javafx.beans.property.IntegerProperty;
import javafx.beans.property.SimpleBooleanProperty;
import javafx.beans.property.SimpleIntegerProperty;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.Arrays;

import static grp25.captcha.tag.Binary.HABITABLE;
import static grp25.captcha.tag.Binary.NON_HABITABLE;
import static java.lang.System.exit;

class ClassifierManager {

    private static ClassifierManager instance;

    private BooleanProperty started = new SimpleBooleanProperty(false);
    private IntegerProperty totalImg = new SimpleIntegerProperty(0);
    private IntegerProperty rows = new SimpleIntegerProperty(2);
    private IntegerProperty cols = new SimpleIntegerProperty(2);
    private IntegerProperty currImg;

    // Source directory
    private File source;

    // Target directory
    private File target;

    private ArrayList<ImgWithTag> imgsWithTags = new ArrayList<>();

    private boolean useFlatten = false;

    private ClassifierManager() {
        started.addListener((dummy, dummy_, start) -> {
            if (start) {
                initImgs();
            }
        });
    }

    static void init() {
        if (instance == null) instance = new ClassifierManager();
    }

    static ClassifierManager getInstance() {
        return instance;
    }

    private void initImgs() {
        File[] imgs = source.listFiles();
        assert imgs != null;

        Arrays.stream(imgs).filter(f -> {
            try {
                return f.isFile() && Files.probeContentType(f.toPath()).split("/")[0].equals("image");
            } catch (IOException e) {
                return false;
            }
        }).forEach(f -> {
            totalImg.set(totalImg.get() + 1);
            try {
                imgsWithTags.add(new ImgWithTag(f, rows.get(), cols.get()));
            } catch (IOException e) {
                e.printStackTrace();
            }
        });
        if (currImg != null) {
            currImg.set(0);
        } else {
            System.out.println("!!! ERROR !!!");
        }
    }

    void save() {
        try {

            File out = new File(target, "output");
            if (!out.exists()) out.mkdirs();
            for (ImgWithTag it : imgsWithTags) {
                File curr = new File(out, it.getImg().getName().replace('.', '_'));
                curr.mkdirs();
                File hab = new File(curr, "hab");
                hab.mkdirs();
                File non = new File(curr, "non");
                non.mkdirs();
                for (int y = 0; y < rows.get(); y++) {
                    for (int x = 0; x < cols.get(); x++) {
                        BufferedImage i = it.getPitch(y, x);
                        if (((Binary) (it.getTag(y, x))) == HABITABLE) {
                            ImageIO.write(i, it.getType(), new File(hab, x + " " + y + "." + it.getType()));
                        } else if (((Binary) (it.getTag(y, x))) == NON_HABITABLE) {
                            ImageIO.write(i, it.getType(), new File(non, x + " " + y + "." + it.getType()));
                        } else {
                            System.out.println("!!!!!!!!!!!!! Not Here");
                        }
                    }
                }
            }
            System.out.println("////////////////////////////");
            System.out.println("////////// Success /////////");
            System.out.println("////////////////////////////");
            exit(0);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    void setSource(File source) {
        this.source = source;

    }

    void setTarget(File target) {
        this.target = target;
    }


    public ArrayList<ImgWithTag> getImgsWithTags() {
        return imgsWithTags;
    }

    BooleanProperty startedProperty() {
        return started;
    }

    void setUseFlatten(boolean useFlatten) {
        this.useFlatten = useFlatten;
    }


    IntegerProperty totalImgProperty() {
        return totalImg;
    }

    IntegerProperty rowsProperty() {
        return rows;
    }

    IntegerProperty colsProperty() {
        return cols;
    }

    void setCurrImg(IntegerProperty p) {
        currImg = p;
    }
}
