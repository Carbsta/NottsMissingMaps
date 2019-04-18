# Captcha Style Manual Classifier

This is the Java code for the manual classifier, which is used to enrich our map data base.


## To build and run

We use:
- IntelliJ IDEA (2018.3.5 Ultimate Edition)
- Java 10

However, only source file are kept in this repository. In this way, all IDE should be able to run these code as long as using Java 10.


## Use the classifier

1. Choose the source folder, which contains pictures to classify. Currently, only png files are tested to be supported, but in theory all image format supported by Java should be fine.
2. Choose the target folder. You can set it to anywhere, evern the same as source folder.
3. Configure the "X slices" and "Y slices". For example, if X is set to 4 and Y is set to 6, you images will be cut into 4 * 6 slices.
4. Flatten source functionality is not currently implemented. Noting will happens if you change it. The program will just read image files in source folder, ignoring all other things including sub folders, if there is any.
5. Toggle the "Put result from different images  in different dir" button if you need. 
6. if you just want to segment images without tagging:
    1. Click the "Just Segment" button to perform the task. The program will automatically exit after finished.
7. Else:
    1. Click "start" / "start with all hab" to start classifying.
    2. When classifying, all patches are originally set to NON_HABITABLE (or HABITABLE if you clicked "start with all hab"), which are marked with BLUE border. You can click them to change them to GREEN, which stands for HABITABLE. ALSO, you can click the "set all hab" and "set all non-hab" to set all of tails in the current image to be habitable/non-habitable.
    3. After finished, click the "End Classification" button and the program will generate the output and then exit.
8. The result will be put in "output" dir below the source folder specified. If there is a dir called "output", the result will be put into "output_1" or "output_2" and so on.


## TODO

- Enable the flatten source feature, which will let the program search images recursively.
- Enable changing X Slices & Y Slices while classifying. Currently they are locked after starting classifying.
- Generalize the program to support richer tags, rather than simple binary habitable/non-habitable.
