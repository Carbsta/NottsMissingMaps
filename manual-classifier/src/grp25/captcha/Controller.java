package grp25.captcha;

import grp25.captcha.tag.Tag;
import javafx.beans.property.BooleanProperty;
import javafx.beans.property.IntegerProperty;
import javafx.beans.property.SimpleIntegerProperty;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.geometry.Insets;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.Slider;
import javafx.scene.control.ToggleButton;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.*;
import javafx.stage.DirectoryChooser;

import javax.imageio.ImageIO;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;

/**
 * The controller class for the FXML.
 */
public class Controller {
    @FXML
    StackPane gridContainer;

    @FXML
    GridPane grid;

    @FXML
    Label sourceLabel, targetLabel, imgIdx, imgTotal, xSlicesLabel, ySlicesLabel;

    @FXML
    Button sourceBtn, targetBtn, prevBtn, nextBtn, startBtn, startWithHabBtn, endBtn, segmentBtn, allHab, allNon;

    @FXML
    ToggleButton useFlatten, diffDir;

    @FXML
    Slider xSlicesSlider, ySlicesSlider;

    private IntegerProperty imgIdxProperty;
    private IntegerProperty totalImgProperty;
    private IntegerProperty rowsProperty;
    private IntegerProperty colsProperty;
    private ArrayList<ImgWithTag> imgsWithTags;

    /**
     * Bind a bunch of properties at the beginning of our program.
     */
    public void initialize() {
        BooleanProperty bp = ClassifierManager.getInstance().startedProperty();
        totalImgProperty = ClassifierManager.getInstance().totalImgProperty();
        rowsProperty = ClassifierManager.getInstance().rowsProperty();
        colsProperty = ClassifierManager.getInstance().colsProperty();
        imgsWithTags = ClassifierManager.getInstance().getImgsWithTags();


        imgIdxProperty = new SimpleIntegerProperty(0); // index from 0
        ClassifierManager.getInstance().setCurrImg(imgIdxProperty);
        imgIdxProperty.addListener((dummy, dummy_, val) -> {
            prevBtn.setDisable((int) val <= 0);
            nextBtn.setDisable((int) val >= totalImgProperty.get() - 1);
            render();
        });
        imgIdxProperty.set(-1);
        imgIdx.textProperty().bind(imgIdxProperty.add(1).asString());


        // visible properties
        sourceBtn.visibleProperty().bind(bp.not());
        targetBtn.visibleProperty().bind(bp.not());

        useFlatten.selectedProperty().addListener((dummy, dummy_, selected) -> {
            useFlatten.setText(selected ? "ON" : "OFF");
            ClassifierManager.getInstance().setUseFlatten(selected);
        });
        useFlatten.disableProperty().bind(bp);

        diffDir.selectedProperty().addListener((dummy, dummy_, selected) -> {
            diffDir.setText(selected ? "ON" : "OFF");
            ClassifierManager.getInstance().setDiffDir(selected);
        });
        diffDir.disableProperty().bind(bp);

        startBtn.disableProperty().bind(bp);
        startWithHabBtn.disableProperty().bind(bp);
        segmentBtn.disableProperty().bind(bp);
        endBtn.disableProperty().bind(bp.not());
        allHab.disableProperty().bind(bp.not());
        allNon.disableProperty().bind(bp.not());


        imgTotal.textProperty().bind(totalImgProperty.asString());
        grid.setVgap(.5);
        grid.setHgap(.5);

        // slider settings
        xSlicesLabel.textProperty().bind(xSlicesSlider.valueProperty().asString());
        ySlicesLabel.textProperty().bind(ySlicesSlider.valueProperty().asString());
        xSlicesSlider.valueProperty().addListener((dummy, dummy_, val) -> {
            xSlicesSlider.setValue(val.intValue());
            colsProperty.set(val.intValue());
        });
        ySlicesSlider.valueProperty().addListener((dummy, dummy_, val) -> {
            ySlicesSlider.setValue(val.intValue());
            rowsProperty.set(val.intValue());
        });
        xSlicesSlider.disableProperty().bind(bp);
        ySlicesSlider.disableProperty().bind(bp);
    }

    /**
     * Handler for the choose source folder button.
     */
    public void chooseSource() {
        File f;
        if (null != (f = folderChooser())) {
            ClassifierManager.getInstance().setSource(f);
            sourceLabel.setText(f.getAbsolutePath());
            sourceLabel.setVisible(true);
        }
    }

    /**
     * Handler for the choose target folder button.
     */
    public void chooseTarget() {
        File f;
        if (null != (f = folderChooser())) {
            ClassifierManager.getInstance().setTarget(f);
            targetLabel.setText(f.getAbsolutePath());
            targetLabel.setVisible(true);
        }
    }

    /**
     * Handler for the start button (start classifying).
     * All patches of all images will be initially set as non-inhabitable.
     */
    public void onStart() {
        if (sourceLabel.isVisible() && targetLabel.isVisible()) {
            ClassifierManager.getInstance().startedProperty().setValue(true);
        } else {
            System.out.println("Something Not set: " +
                    (sourceLabel.isVisible() ? "" : sourceLabel) +
                    (targetLabel.isVisible() ? "" : "\nand\n" + targetLabel + "\n\n"));
        }
    }

    /**
     * Handler for the "START with all Hab" button (start classifying).
     * All patches of all images will be initially set as inhabitable.
     */
    public void onStartWithHab() {
        ClassifierManager.getInstance().setDefaultHab(true);
        onStart();
    }

    /**
     * Handler for end classifying and export the result.
     */
    public void onEnd() {
        ClassifierManager.getInstance().save();
    }

    /**
     * Handler for the "just segment" button.
     * This will just segment images in source folder and export the result.
     */
    public void onSegment() {
        onStart();
        if (ClassifierManager.getInstance().startedProperty().get())
            ClassifierManager.getInstance().saveSegment();
    }

    /**
     * Set the tags of all the patches of current image.
     *
     * @param e the action event. We recognize the button pressed (set all hab
     *          or set all non-hab) through this and respond differently.
     */
    public void setAll(ActionEvent e) {
        imgsWithTags.get(imgIdxProperty.get()).setAll(
                ((Button) e.getSource()).getText().equals("set all hab"));
        render();
    }

    /**
     * Set current image to previous image in the image array.
     */
    public void prevImg() {
        imgIdxProperty.set(imgIdxProperty.get() - 1);
    }

    /**
     * Set current image to next image in the image array.
     */
    public void nextImg() {
        imgIdxProperty.set(imgIdxProperty.get() + 1);
    }

    private void render() {
        if (totalImgProperty.get() != 0) {
            ImgWithTag curr = imgsWithTags.get(imgIdxProperty.get());
            grid.getChildren().clear();
            grid.getRowConstraints().clear();
            grid.getColumnConstraints().clear();

            for (int i = 0; i < rowsProperty.get(); i++) {
                grid.getRowConstraints().add(new RowConstraints());
            }
            for (int i = 0; i < colsProperty.get(); i++) {
                grid.getColumnConstraints().add(new ColumnConstraints());
            }

            for (int i = 0; i < grid.getRowCount(); i++) {
                for (int j = 0; j < grid.getColumnCount(); j++) {
                    ImagePatch ip = new ImagePatch(curr, i, j);
                    GridPane.setConstraints(ip, j, i);
                    grid.getChildren().add(ip);
                }
            }

        }
    }

    private File folderChooser() {
        DirectoryChooser fc = new DirectoryChooser();
        return fc.showDialog(null);
    }

    /**
     * The image patch class. It can be clicked and its tag will be flipped.
     */
    class ImagePatch extends StackPane {
        /**
         * The constructor of image patch.
         *
         * @param it  The {@link ImgWithTag} data.
         * @param row The row index of this patch.
         * @param col The column index of this patch.
         */
        ImagePatch(ImgWithTag it, int row, int col) {
            super();
            ImageView iv = new ImageView();
            try {
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ImageIO.write(it.getPatch(row, col), it.getType(), baos);
                iv.setImage(new Image(new ByteArrayInputStream(baos.toByteArray())));
                iv.setFitHeight(700d / colsProperty.get());
                iv.setPreserveRatio(true);
                getChildren().add(iv);
                Tag t = it.getTag(row, col);
                setPadding(new Insets(.5));
                setBorder(new Border(new BorderStroke(t.getColor(), BorderStrokeStyle.SOLID, null, new BorderWidths(2))));
                setOnMouseClicked(e -> {
                    Tag t2 = it.getTag(row, col).next();
                    it.setTag(row, col, t2);
                    setBorder(new Border(new BorderStroke(t2.getColor(), BorderStrokeStyle.SOLID, null, new BorderWidths(2))));
                });
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
