var CSRF_TOKEN = $('meta[name="csrf-token"]').attr('content');
// Prevent Dropzone from auto discovering this element:
Dropzone.options.myDrop = false;
// This is useful when you want to create the
// Dropzone programmatically later

// Disable auto discover for all elements:
Dropzone.autoDiscover = false;

// transform cropper dataURI output to a Blob which Dropzone accepts
function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/jpeg' });
}

$(function() {
    $(".text-imgfeature").on("click",function(){
         
            $('#upload-profileimage').modal('show'); 
             
    });
    // modal window template
    var modalTemplate = '<div class="modal fade " id="crop-image" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' 
        + '<div class="modal-dialog" style="width:450px" role="document">'             
            + '<div class="modal-content" >'
                  + '<div class="modal-body">'
                        +'<div class="image-container">'
                        +'</div>' 
                  + '</div>'
                  + '<div class="modal-footer">'
                    + '<button type="button" class="btn btn-success btn-sm crop-upload" ><i class="fa fa-cloud-upload-alt"></i> Upload </button>'
                    + '<button type="button" class="btn btn-danger btn-sm modal-cancel" ><i class="fa fa-times"></i> Cancel </button>'
                  + '</div>'
            + '</div>'
        + '</div>'
    +'</div>';
    var generalUploadedFileName = "";
    var myDropzone =  $('div#myDrop').dropzone({
        url: "Your_File_Upload_Url",
        allowedFileTypes: 'image/*',
        dictDefaultMessage: '<i class="fa fa-2x fa-cloud-upload-alt"></i><br/> Drop images file here to upload. <br/> No more than 5mb size.',
        addRemoveLinks: true,
        autoProcessQueue: false,
        headers: {
                    'x-csrf-token': CSRF_TOKEN,
        },
        
        success: function(res, index){
                       
            generalUploadedFileName = index.name;
                       
        },
        removedfile: function(file,response) {
            if(generalUploadedFileName) {
                var name = generalUploadedFileName;       
                $.ajax({
                    type: 'POST',
                    url: "Your_file_Remove_Url",
                    data: "id="+name ,
                    dataType: 'html'
                });
            }
            var _ref;
            return (_ref = file.previewElement) != null ? _ref.parentNode.removeChild(file.previewElement) : void 0;      
             
        },
        maxFiles: 1,

        params:{
            'action': 'save'
        },
        init: function() {
            // Using a closure.
            var _this = this;

            this.on('thumbnail', function (file) {

                // ignore files which were already cropped and re-rendered
                // to prevent infinite loop
                if (file.cropped) {
                    return;
                }
                if (file.width < 800) {
                    // validate width to prevent too small files to be uploaded
                    // .. add some error message here
                    return;
                }
                // cache filename to re-assign it to cropped file
                var cachedFilename = file.name;
                // remove not cropped file from dropzone (we will replace it later)
                this.removeFile(file);
                $('#upload-profileimage').modal('toggle'); 
                // dynamically create modals to allow multiple files processing
                var $cropperModal = $(modalTemplate);
                // 'Crop and Upload' button in a modal
                var $uploadCrop = $cropperModal.find('.crop-upload');

                var $img = $('<img style="max-width: 100%;" />');
                // initialize FileReader which reads uploaded file
                var reader = new FileReader();
                reader.onloadend = function () {
                    // add uploaded and read image to modal
                    $cropperModal.find('.image-container').html($img);
                    $img.attr('src', reader.result);

                    // initialize cropper for uploaded image
                    $img.cropper({
                        aspectRatio: 1,
                        autoCropArea: 1,
                        movable: false,
                        cropBoxResizable: true,
                        minContainerWidth: 250,
                        minContainerHeight: 250
                    });
                };
                // read uploaded file (triggers code above)
                reader.readAsDataURL(file);

                $cropperModal.modal('show');

                // listener for 'Crop and Upload' button in modal
                $uploadCrop.on('click', function() {
                    // get cropped image data
                    var blob = $img.cropper('getCroppedCanvas').toDataURL();
                    // transform it to Blob object
                    var newFile = dataURItoBlob(blob);
                    // set 'cropped to true' (so that we don't get to that listener again)
                    newFile.cropped = true;
                    // assign original filename
                    newFile.name = cachedFilename;
                    
                    // add cropped file to dropzone
                    _this.addFile(newFile);
                    // upload cropped file with dropzone
                    _this.processQueue();
                    $cropperModal.modal('hide');
                    $('#upload-profileimage').modal('show'); 
                });
            });
        },
    });
