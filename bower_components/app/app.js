/**
 * @file 
 * Provides angularjs views and controller utilities.
 *
 * all te angularjs scopes and controller methods presence here
 *
 * Author: Viniston Fernando
 */


var app = angular.module('captchaApp', ['vcRecaptcha', 'ui.select2']);

app.controller('mainCtrl', function ($scope, vcRecaptchaService) {

    //Fake google captcha server response
    var fakeSuccesModel = {
        "success": true,
        "error-codes": []   // optional
    }

    $('.btsrpdate').datepicker({ format: "dd-mm-yyyy", language: 'en' }); $('[title!=""]').qtip({ style: { classes: 'qtip-dark qtip-shadow qtip-rounded"' } });

    $scope.geoCountries = [{ id: "IN", Caption: "India", States: [{ id: "KA", Caption: "Karnataka", Cities: [{ id: "BA", Caption: "Bangalore" }, { id: "MY", Caption: "Mysore" }] }, { id: "MB", Caption: "Mumbai", Cities: [{ id: "NM", Caption: "Navi Mumbai" }, { id: "PN", Caption: "Pune" }] }, { id: "TN", Caption: "Tamil Nadu", Cities: [{ id: "CH", Caption: "Chennai" }, { id: "TT", Caption: "TutiCorin" }] }] }, { id: "USA", Caption: "United States of America", States: [{ id: "AR", Caption: "Arizona", Cities: [{ id: "PH", Caption: "Phoenix" }, { id: "TU", Caption: "Tucson" }] }, { id: "CL", Caption: "California", Cities: [{ id: "LA", Caption: "Los Angeles" }, { id: "SD", Caption: "San Diego" }] }, { id: "NY", Caption: "New York", Cities: [{ id: "SY", Caption: "Syracuse" }, { id: "YO", Caption: "Yonkers" }] }] }];

    $scope.formSrc = { "State": [], "City": [] };

    $scope.response = null; $scope.widgetId = null;

    $scope.model = {
        key: '6LeMpBkTAAAAANfxbLei6H6_hAVal2n6h8NM5MxZ' //captcha service public key of Viniston Fernando's mail id
    };

    $scope.userModel = {
        firstName: '',
        lastName: '',
        dob: '',
        email: '',
        country: '',
        state: '',
        city: '',
        grecaptcharesponse: ''
    }

    $scope.setResponse = function (response) {
        console.info('Response available');

        $scope.response = response;
    };

    $scope.setWidgetId = function (widgetId) {

        console.info('Created widget ID: %s', widgetId);

        $scope.widgetId = widgetId;
    };

    $scope.cbExpiration = function () {
        console.info('Captcha expired. Resetting response object');

        vcRecaptchaService.reload($scope.widgetId);

        $scope.response = null;
    };

    $scope.populateOptions = function (type) {
        if (type == "country") {
            $scope.userModel.state = '', $scope.userModel.city = '';
            $scope.formSrc.State, $scope.formSrc.City = [];
            if ($scope.userModel.country != '') {
                $scope.formSrc.State = $.grep($scope.geoCountries, function (rel) {
                    return rel.id == $scope.userModel.country;
                })[0].States;

            }
        }
        if (type == "state") {
            $scope.userModel.city = '';
            if ($scope.userModel.country != '') {
                var states = $.grep($scope.geoCountries, function (rel) {
                    return rel.id == $scope.userModel.country;
                })[0].States;
                $scope.formSrc.City = $.grep(states, function (rel) {
                    return rel.id == $scope.userModel.state;
                })[0].Cities;

            }
        }
    }

    $scope.submitUser = function (event) {

        //validate the form. Using Nod.js we can validate the necessary model properties.
        //Instead HTML5 recquired validator this Nod.js is using for dynamic validation with good UI

        setTimeout(function () { $("#btnTemp").click(); }, 200);
        $("#RegMetadata").removeClass('notvalidate'); if ($("#RegMetadata .error").length > 0) { event.stopImmediatePropagation(); event.stopPropagation(); return false; }

        /* vcRecaptchaService.getResponse() gives you the g-captcha-response */
        if (vcRecaptchaService.getResponse() === "") { //if string is empty
            bootbox.alert("Please resolve the captcha and submit!");
        }
        else {

            /**
             * SERVER SIDE VALIDATION
             *
             * You need to implement your server side validation here.
             * Send the reCaptcha response to the server and use some of the server side APIs to validate it
             * See https://developers.google.com/recaptcha/docs/verify
             */
            $scope.userModel.grecaptcharesponse = vcRecaptchaService.getResponse();

            //now user model is the pay load for the user registration //$scope.userModel

            //Using fake server response as the successfull verification
            if (fakeSuccesModel.success) {
                $('.top-right').notify({ message: { text: "Captcha validated successfully with the fake server response and user " + $scope.userModel.firstName + " created." }, type: 'success', fadeOut: { enabled: true, delay: 3 * 1000 } }).show();
                setTimeout(function () { vcRecaptchaService.reload($scope.widgetId); location.reload(); }, 3100)
            } else {
                $('.top-right').notify({ message: { text: "Captcha not validated." }, type: 'danger', fadeOut: { enabled: true, delay: 3 * 1000 } }).show();
                // In case of a failed validation you need to reload the captcha
                // because each response can be checked just once
                setTimeout(function () { vcRecaptchaService.reload($scope.widgetId); location.reload(); }, 3100)
            }

        }
        return false;
    };

    //For dynamic validation models
    function GetValidationList() {

        var validationArr = [
               ['#select2-country', 'presence', 'Please select proper Country'], ['#select2-state', 'presence', 'Please select proper State'],
               ['#select2-city', 'presence', 'Please select proper City'], ['#userName', 'presence', 'Cannot be empty'],
               ['#lastName', 'presence', 'Cannot be empty'], ['#email', 'presence', 'Cannot be empty'],
               ['#dateofbirth', 'presence', 'Cannot be empty'], ['#email', 'email', 'Must be a valid email']
        ];
        var valcoll = [];
        for (var i = 0, val = {}; val = validationArr[i++];) {
            valcoll.push(val);
        }

        $("#Reg").nod(valcoll, {
            'disableSubmitBtn': false,
            'delay': 200,
            'submitBtnSelector': '#btnTemp',
            'silentSubmit': 'true'
        });
    }
    GetValidationList();
});