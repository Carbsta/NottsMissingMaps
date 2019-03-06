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
import java.io.*;
import java.util.ArrayList;

public class Controller {
    @FXML
    StackPane gridContainer;

    @FXML
    GridPane grid;

    @FXML Label sourceLabel, targetLabel, imgIdx, imgTotal, xSlicesLabel, ySlicesLabel;

    @FXML Button sourceBtn, targetBtn, prevBtn, nextBtn, startBtn, endBtn;

    @FXML ToggleButton useFlatten;

    @FXML Slider xSlicesSlider, ySlicesSlider;

    private IntegerProperty imgIdxProperty;
    private IntegerProperty totalImgProperty;
    private IntegerProperty rowsProperty;
    private IntegerProperty colsProperty;
    private ArrayList<ImgWithTag> imgsWithTags;


    public void initialize() {
        BooleanProperty bp = ClassifierManager.getInstance().startedProperty();
        totalImgProperty = ClassifierManager.getInstance().totalImgProperty();
        rowsProperty = ClassifierManager.getInstance().rowsProperty();
        colsProperty = ClassifierManager.getInstance().colsProperty();
        imgsWithTags = ClassifierManager.getInstance().getImgsWithTags();


        imgIdxProperty = new SimpleIntegerProperty(-1); // index from 0
        ClassifierManager.getInstance().setCurrImg(imgIdxProperty);
        imgIdxProperty.addListener((dummy, dummy_, val) -> {
            prevBtn.setDisable((int) val <= 0);
            nextBtn.setDisable((int) val >= totalImgProperty.get() - 1);
            render();
        });
        imgIdx.textProperty().bind(imgIdxProperty.add(1).asString());

        // visible properties
        sourceBtn.visibleProperty().bind(bp.not());
        targetBtn.visibleProperty().bind(bp.not());

        useFlatten.selectedProperty().addListener((dummy, dummy_, selected) -> {
            useFlatten.setText(selected ? "ON" : "OFF");
            ClassifierManager.getInstance().setUseFlatten(selected);
        });
        useFlatten.disableProperty().bind(bp);
        startBtn.disableProperty().bind(bp);
        endBtn.disableProperty().bind(bp.not());

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

    public void chooseSource (ActionEvent e) {
        File f;
        if (null != (f = folderChooser(e))) {
            ClassifierManager.getInstance().setSource(f);
            sourceLabel.setText(f.getAbsolutePath());
            sourceLabel.setVisible(true);
        }
    }

    public void chooseTarget (ActionEvent e) {
        File f;
        if (null != (f = folderChooser(e))) {
            ClassifierManager.getInstance().setTarget(f);
            targetLabel.setText(f.getAbsolutePath());
            targetLabel.setVisible(true);
        }
    }

    public void onStart () {
        if (sourceLabel.isVisible() && targetLabel.isVisible()) {
            ClassifierManager.getInstance().startedProperty().setValue(true);
        } else {
            System.out.println("Something Not set: " +
                    (sourceLabel.isVisible() ? "" : sourceLabel) +
                    (targetLabel.isVisible() ? "" : "\n\nand\n\n" + targetLabel));
        }
    }

    public void onEnd() {
        ClassifierManager.getInstance().save();
    }


    public void prevImg() {
        imgIdxProperty.set(imgIdxProperty.get() - 1);
    }

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

    class ImagePatch extends StackPane {
        ImagePatch(ImgWithTag it, int row, int col) {
            super();
            ImageView iv = new ImageView();
            try {
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ImageIO.write(it.getPitch(row, col), it.getType(), baos);
                iv.setImage(new Image(new ByteArrayInputStream(baos.toByteArray())));
                iv.setFitHeight(500d / colsProperty.get());
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


    private File folderChooser (ActionEvent e) {
        DirectoryChooser fc = new DirectoryChooser();
        return fc.showDialog(null);
    }
}
