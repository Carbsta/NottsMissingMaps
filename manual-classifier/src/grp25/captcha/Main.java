package grp25.captcha;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;

/**
 * The Main class of the whole app.
 */
public class Main extends Application {

    public static void main(String[] args) {
        launch(args);
    }

    /**
     * A simple entrance of the app. Don't worry about the scene size it set.
     * The window will be maximized after launching.
     * @param primaryStage The primaryStage.
     * @throws Exception Any exception throws by any function it called.
     */
    @Override
    public void start(Stage primaryStage) throws Exception {

        ClassifierManager.init();
        Parent root = FXMLLoader.load(getClass().getResource("main.fxml"));
        primaryStage.setTitle("Captcha Style Quick Classifier");
        primaryStage.setScene(new Scene(root, 300, 275));
        primaryStage.show();
        primaryStage.setMaximized(true);
    }
}
