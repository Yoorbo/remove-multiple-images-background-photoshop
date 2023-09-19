// Prompt the user to choose the source folder
var sourceFolder = Folder.selectDialog("Select the folder containing all the images to be processed");

if (sourceFolder == null) {
    alert("No source folder selected. The script will exit.");
} else {
    // Prompt the user to choose the save folder
    var saveFolder = Folder.selectDialog("Select the folder to save the output images");

    if (saveFolder == null) {
        alert("No save folder selected. The script will exit.");
    } else {
        // Prompt the user to choose the background color
        var colorRef = new SolidColor;
        colorRef.rgb.red = prompt("Enter the red component of the background color (0-255)", 255);
        colorRef.rgb.green = prompt("Enter the green component of the background color (0-255)", 255);
        colorRef.rgb.blue = prompt("Enter the blue component of the background color (0-255)", 255);

        // Prompt the user to choose whether to make the background transparent
        var isTransparent = confirm("Do you want to make the background transparent?");

        // Prompt the user to choose whether to use an image as the background
        var isImageBg = confirm("Do you want to use an image as the background?");

        // Check if it's selected to use an image as the background
        if (isImageBg) {
            // Store the background image in a variable
            var doc_bg = app.activeDocument;
        }

        // Check if the source folder is not null
        if (sourceFolder != null) {
            var fileList = sourceFolder.getFiles(/\.(jpg|jpeg|png|tif|psd|crw|cr2|nef|dcr|dc2|raw|heic)$/i);
        } else {
            alert("No images found in the source folder.");
        }

        // Now, open every file in the file list
        for (var a = 0; a < fileList.length; a++) {
            // Open the file in Photoshop
            app.open(fileList[a]);

            // Select the subject
            var idautoCutout = stringIDToTypeID("autoCutout");
            var desc01 = new ActionDescriptor();
            var idsampleAllLayers = stringIDToTypeID("sampleAllLayers");
            desc01.putBoolean(idsampleAllLayers, false);
            try {
                executeAction(idautoCutout, desc01, DialogModes.NO);
            } catch (err) { }

            // Invert the selection
            app.activeDocument.selection.invert();

            // Now that the background is selected, the next step is to fill or clear the selection.
            if (isTransparent) {
                // Make the active layer a normal layer.
                app.activeDocument.activeLayer.isBackgroundLayer = false;
                // Make the selection transparent
                app.activeDocument.selection.clear();
            } else {
                app.activeDocument.selection.fill(colorRef);
            }

            // Check if it's selected to use an image as the background
            if (isImageBg) {
                // Store the main document in a variable
                var main_doc = app.activeDocument;
                // Switch to the background image
                app.activeDocument = doc_bg;
                // Copy the background to the main image
                app.activeDocument.activeLayer.duplicate(main_doc, ElementPlacement.PLACEATEND);
                // Switch back to the main image
                app.activeDocument = main_doc;
            }

            // The image is now processed. The next step is to save the image.
            // Create the file name
            var fileName = app.activeDocument.name.replace(/\.[^\.]+$/, '');
            var pngSaveOptions = new PNGSaveOptions();
            // Edit PNG options here if needed.
            // Save the image as PNG
            app.activeDocument.saveAs(new File(saveFolder + '/' + Date.now() + "_" + fileName + '.png'), pngSaveOptions, true, Extension.LOWERCASE);
            // Close the image without saving as PSD
            app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
        }
    }
}
