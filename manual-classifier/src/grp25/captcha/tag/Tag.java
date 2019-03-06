package grp25.captcha.tag;


import javafx.scene.paint.Color;

public interface Tag {
    int getSize();

    Tag next();

    Color getColor();
}
