import * as Cropper from 'cropperjs';

new Cropper(image, {
  ready: function () {
    // this.cropper[method](argument1, , argument2, ..., argumentN);
    this.cropper.move(1, -1);

    // Allows chain composition
    this.cropper.move(1, -1).rotate(45).scale(1, -1);
  }
});

new Cropper(image, {
  autoCrop: false,
  ready: function () {
    // Do something here
    // ...

    // And then
    this.cropper.crop();
  }
});

var image = <HTMLImageElement>document.getElementById('image');
var cropper = new Cropper(image, {
  aspectRatio: 16 / 9,
  crop: function(e) {
    console.log(e.detail.x);
    console.log(e.detail.y);
    console.log(e.detail.width);
    console.log(e.detail.height);
    console.log(e.detail.rotate);
    console.log(e.detail.scaleX);
    console.log(e.detail.scaleY);
  }
});

cropper.move(1);
cropper.move(1, 0);
cropper.move(0, -1);

cropper.zoom(0.1);
cropper.zoom(-0.1);

cropper.zoomTo(1); // 1:1 (canvasData.width === canvasData.naturalWidth)

cropper.rotate(90);
cropper.rotate(-90);

cropper.scale(-1); // Flip both horizontal and vertical
cropper.scale(-1, 1); // Flip horizontal
cropper.scale(1, -1); // Flip vertical

var imageData = cropper.getImageData();
var canvasData = cropper.getCanvasData();

if (imageData.rotate % 180 === 0) {
  console.log(canvasData.naturalWidth === imageData.naturalWidth); // true
}

cropper.getCroppedCanvas();

cropper.getCroppedCanvas({
  width: 160,
  height: 90
});

// Upload cropped image to server if the browser supports `HTMLCanvasElement.toBlob`
cropper.getCroppedCanvas().toBlob(function (blob) {
  var formData = new FormData();

  formData.append('croppedImage', blob);
});

image.addEventListener('ready', function (this: Cropper.CropperEventTarget) {
  console.log(this.cropper === cropper);
  // -> true
});

// <https://github.com/fengyuanchen/cropperjs/blob/master/examples/a-range-of-aspect-ratio.html>
(function () {
  window.addEventListener('DOMContentLoaded', function () {
    var image = <HTMLImageElement> document.querySelector('#image');
    var minAspectRatio = .5;
    var maxAspectRatio = 1.5;
    var cropper = new Cropper(image, {
      ready: function () {
        var cropper: Cropper = this.cropper;
        var containerData = cropper.getContainerData();
        var cropBoxData = cropper.getCropBoxData();
        var aspectRatio = cropBoxData.width / cropBoxData.height;
        var newCropBoxWidth: number;

        if (aspectRatio < minAspectRatio || aspectRatio > maxAspectRatio) {
          newCropBoxWidth = cropBoxData.height * ((minAspectRatio + maxAspectRatio) / 2);

          cropper.setCropBoxData({
            left: (containerData.width - newCropBoxWidth) / 2,
            width: newCropBoxWidth
          });
        }
      },
      cropmove: function () {
        var cropper: Cropper = this.cropper;
        var cropBoxData = cropper.getCropBoxData();
        var aspectRatio = cropBoxData.width / cropBoxData.height;

        if (aspectRatio < minAspectRatio) {
          cropper.setCropBoxData({
            width: cropBoxData.height * minAspectRatio
          });
        } else if (aspectRatio > maxAspectRatio) {
          cropper.setCropBoxData({
            width: cropBoxData.height * maxAspectRatio
          });
        }
      }
    });
  });
})();

// <https://github.com/fengyuanchen/cropperjs/blob/master/examples/crop-a-round-image.html>
(function () {
  function getRoundedCanvas(sourceCanvas: HTMLCanvasElement) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var width = sourceCanvas.width;
    var height = sourceCanvas.height;
    canvas.width = width;
    canvas.height = height;
    //context.imageSmoothingEnabled = true;
    context.drawImage(sourceCanvas, 0, 0, width, height);
    context.globalCompositeOperation = 'destination-in';
    context.beginPath();
    context.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, 2 * Math.PI, true);
    context.fill();
    return canvas;
  }
  window.addEventListener('DOMContentLoaded', function () {
    var image = <HTMLImageElement> document.getElementById('image');
    var button = <HTMLButtonElement> document.getElementById('button');
    var result = <HTMLDivElement> document.getElementById('result');
    var croppable = false;
    var cropper = new Cropper(image, {
      aspectRatio: 1,
      viewMode: 1,
      ready: function () {
        croppable = true;
      }
    });
    button.onclick = function () {
      var croppedCanvas: HTMLCanvasElement;
      var roundedCanvas: HTMLCanvasElement;
      var roundedImage: HTMLImageElement;
      if (!croppable) {
        return;
      }
      // Crop
      croppedCanvas = cropper.getCroppedCanvas();
      // Round
      roundedCanvas = getRoundedCanvas(croppedCanvas);
      // Show
      roundedImage = document.createElement('img');
      roundedImage.src = roundedCanvas.toDataURL()
      result.innerHTML = '';
      result.appendChild(roundedImage);
    };
  });
})();

// <https://github.com/fengyuanchen/cropperjs/blob/master/examples/crop-on-canvas.html>, slightly edited
(function () {
function start(this: HTMLImageElement) {
  var canvas = <HTMLCanvasElement> document.getElementById('canvas');
  var width = this.offsetWidth;
  var height = this.offsetHeight;
  var cropper: Cropper;
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(
    this,
    0, 0, this.naturalWidth, this.naturalHeight,
    0, 0, width, height
  );
  cropper = new Cropper(canvas);
}
window.addEventListener('DOMContentLoaded', function () {
  var image = <HTMLImageElement> document.getElementById('image');
  if (image.complete) {
    start.call(image);
  } else {
    image.onload = start;
  }
});
})();

// <https://github.com/fengyuanchen/cropperjs/blob/master/examples/customize-preview.html>
(function () {
  function each<T>(arr: ArrayLike<T>, callback: (this: ArrayLike<T>, item: T, idx: number, arr: ArrayLike<T>) => void) {
    var length = arr.length;
    var i;
    for (i = 0; i < length; i++) {
      callback.call(arr, arr[i], i, arr);
    }
    return arr;
  }
  window.addEventListener('DOMContentLoaded', function () {
    var image = <HTMLImageElement> document.querySelector('#image');
    var previews = <NodeListOf<HTMLDivElement>> document.querySelectorAll('.preview');
    var cropper = new Cropper(image, {
        ready: function () {
          var clone = <HTMLElement> (<HTMLElement> (<EventTarget> this)).cloneNode();
          clone.className = ''
          clone.style.cssText = (
            'display: block;' +
            'width: 100%;' +
            'min-width: 0;' +
            'min-height: 0;' +
            'max-width: none;' +
            'max-height: none;'
          );
          each(previews, function (elem) {
            elem.appendChild(clone.cloneNode());
          });
        },
        crop: function (e) {
          var data = e.detail;
          var cropper = this.cropper;
          var imageData = cropper.getImageData();
          var previewAspectRatio = data.width / data.height;
          each(previews, function (elem) {
            var previewImage = elem.getElementsByTagName('img').item(0);
            var previewWidth = elem.offsetWidth;
            var previewHeight = previewWidth / previewAspectRatio;
            var imageScaledRatio = data.width / previewWidth;
            elem.style.height = previewHeight + 'px';
            previewImage.style.width = imageData.naturalWidth / imageScaledRatio + 'px';
            previewImage.style.height = imageData.naturalHeight / imageScaledRatio + 'px';
            previewImage.style.marginLeft = -data.x / imageScaledRatio + 'px';
            previewImage.style.marginTop = -data.y / imageScaledRatio + 'px';
          });
        }
      });
  });
})();

// <https://github.com/fengyuanchen/cropperjs/blob/master/examples/fixed-crop-box.html>
(function () {
  window.addEventListener('DOMContentLoaded', function () {
    var image = <HTMLImageElement> document.querySelector('#image');
    var cropper = new Cropper(image, {
      dragMode: 'move',
      aspectRatio: 16 / 9,
      autoCropArea: 0.65,
      restore: false,
      guides: false,
      center: false,
      highlight: false,
      cropBoxMovable: false,
      cropBoxResizable: false,
      toggleDragModeOnDblclick: false,
    });
  });
})();

// <https://github.com/fengyuanchen/cropperjs/blob/master/examples/full-crop-box.html>
(function () {
  window.addEventListener('DOMContentLoaded', function () {
    var image = <HTMLImageElement> document.querySelector('#image');
    var cropper = new Cropper(image, {
      viewMode: 3,
      dragMode: 'move',
      autoCropArea: 1,
      restore: false,
      modal: false,
      guides: false,
      highlight: false,
      cropBoxMovable: false,
      cropBoxResizable: false,
      toggleDragModeOnDblclick: false,
    });
  });
})();

// <https://github.com/fengyuanchen/cropperjs/blob/master/examples/multiple-croppers.html>
(function () {
  window.addEventListener('DOMContentLoaded', function () {
    var images = <NodeListOf<HTMLImageElement>> document.querySelectorAll('img');
    var length = images.length;
    var croppers: Cropper[] = [];
    var i: number;
    for (i = 0; i < length; i++) {
      croppers.push(new Cropper(images[i]));
    }
  });
})();

// <https://github.com/fengyuanchen/cropperjs/blob/master/examples/responsive-container.html>
(function () {
  window.addEventListener('DOMContentLoaded', function () {
    var image = <HTMLImageElement> document.querySelector('#image');
    var cropper = new Cropper(image, {
      movable: false,
      zoomable: false,
      rotatable: false,
      scalable: false
    });
    document.getElementById('replace').onclick = function () {
      cropper.replace('../docs/images/picture-2.jpg');
    };
  });
})();