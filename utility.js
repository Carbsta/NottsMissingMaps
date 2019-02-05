/*jslint browser: true*/
/*global  $*/


$(function () {
    'use strict';
    
    // Expand and collapse individual cards to show addition information
    $('h2').click(function () {

        // If card is collapsed, expand
        if ($(this).parent().height() === 200) {
            $(this).parent().animate({height: '+=200px'}, {queue: false});
            $(this).hide();
            $(this).next().show();
            $(this).animate({top: '+=200px'}, {queue: false});
            $(this).next().animate({top: '+=200px'}, {queue: false});

        // If card is expanded, collapse
        } else if ($(this).parent().height() === 400) {
            $(this).parent().animate({height: '200px'}, {queue: false});
            $(this).hide();
            $(this).prev().show();
            $(this).animate({top: '-=200px'}, {queue: false});
            $(this).prev().animate({top: '-=200px'}, {queue: false});
        }
    });
    
    // Expand all cards
    $('#expandAll').click(function () {

        $('.roundedBox').animate({height: '400px'});
    });
    
    // Collapse all cards
    $('#collapseAll').click(function () {

        $('.roundedBox').animate({height: '200px'});
    });
});
