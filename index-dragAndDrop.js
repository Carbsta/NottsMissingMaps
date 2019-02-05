(function ( document, window, index ){

  // applying the effect for every form
  let forms = document.querySelectorAll( '.box' );
  Array.prototype.forEach.call( forms, form => {
    let input = form.querySelector( 'input[type="file"]' )
    let label = form.querySelector( 'label' )
    let errorMsg = form.querySelector( '.box__error span' )
    let droppedFiles = null
    let triggerFormSubmit = () => {
      let files = [...input.files]
      let filtered = files.filter(file => file.type.split("/")[0] == 'image')
      let invalidFile = files.length - filtered.length
      if (invalidFile) alert(invalidFile + " of " + files.length + " file(s) are invalid and ignored!");
      addFiles(filtered);

      // TODO: add ajax

    } 

    // automatically submit the form on file select
    input.addEventListener( 'change', e => {
      triggerFormSubmit()
    });

    // drag&drop files if the feature is available
    form.classList.add( 'has-advanced-upload' ); // letting the CSS part to know drag&drop is supported by the browser

    [ 'drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop' ]
    .forEach( eventName => {
      form.addEventListener( eventName, e => {
        // preventing the unwanted behaviours
        e.preventDefault();
        e.stopPropagation();
      });
    });

    form.addEventListener( "dragover", e => form.classList.add( 'is-dragover' ));

    [ 'dragleave', 'dragend', 'drop' ].forEach( eventName => {
      form.addEventListener( eventName, e => form.classList.remove( 'is-dragover' ))
    });

    form.addEventListener( 'drop', e => input.files = e.dataTransfer.files );

    // if the form was submitted
    form.addEventListener( 'submit', function( e ){
      // preventing the duplicate submissions if the current one is in progress
      if( form.classList.contains( 'is-uploading' ) ) return false;

      form.classList.add( 'is-uploading' );
      form.classList.remove( 'is-error' );

      e.preventDefault();
      e.stopPropagation();


      // gathering the form data
      // let ajaxData = new FormData( form );
      // Array.prototype.forEach.call( droppedFiles, function( file )
      // {
      //   ajaxData.append( input.getAttribute( 'name' ), file );
      // });

      // // ajax request
      // let ajax = new XMLHttpRequest();
      // ajax.open( form.getAttribute( 'method' ), form.getAttribute( 'action' ), true );

      // ajax.onload = function()
      // {
      //   form.classList.remove( 'is-uploading' );
      //   if( ajax.status >= 200 && ajax.status < 400 )
      //   {
      //     let data = JSON.parse( ajax.responseText );
      //     form.classList.add( data.success == true ? 'is-success' : 'is-error' );
      //     if( !data.success ) errorMsg.textContent = data.error;
      //   }
      //   else alert( 'Error. Please, contact the webmaster!' );
      // };

      // ajax.onerror = function()
      // {
      //   form.classList.remove( 'is-uploading' );
      //   alert( 'Error. Please, try again!' );
      // };

      // ajax.send( ajaxData );


    });

    // Firefox focus bug fix for file input
    input.addEventListener( 'focus', function(){ input.classList.add( 'has-focus' ); });
    input.addEventListener( 'blur', function(){ input.classList.remove( 'has-focus' ); });

  });
})( document, window, 0 );

