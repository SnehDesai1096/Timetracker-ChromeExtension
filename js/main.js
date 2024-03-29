// Stores the width of each bar in pixels
var barWidth = 15;
// Stores the spacing between each line bar in pixels
var barSpacing = 10;


// Quotes about wastage of time


$(document).ready(function(){

    var backgroundPage = chrome.extension.getBackgroundPage();
    while(backgroundPage === null){
      backgroundPage = chrome.extension.getBackgroundPage();  
    }

    chrome.storage.local.get("sitesLocked", function(result){
        if(backgroundPage !== null && backgroundPage.isFirstRun) {
            $('.settingsPanel').addClass('is-visible');
            $('.tracksiteInput').addClass('inputEnabled');
            $('.lockBtn').remove();
            $('.buttonsContainer').append("<img src = \"images/button_OK.png\" class = \"done\">");
            $('.done').css({"float" : "none" , "margin" : "0 auto"})
        }else if(result.sitesLocked){
            //remove all the buttons 
            $('.done').remove();
            $('.editBtn').remove();
            $('.lockBtn').remove();
            $('.tracksiteInput').removeClass("inputEnabled");
            $('.tracksiteInput').addClass("inputDisabled");
            $('.tracksiteInput').prop("disabled", true);
        } else {
            $('.done').remove();
            $('.tracksiteInput').css({"border": "none"});
            $('.tracksiteInput').prop("disabled", true);
            $('.tracksiteInput').removeClass('inputEnabled');
            $('.tracksiteInput').addClass('inputDisabled');
            $('.buttonsContainer').append("<img src = \"images/button_EDIT.png\" class = \"editBtn\">");
        }

    });


    // Try to update the data from the localStorage if we can about the sites that are being tracked
    if(chrome.extension.getBackgroundPage().isFirstRun){
        chrome.storage.local.get("trackData", function(result){
               var sitesBeingTracked = JSON.parse(result.trackData);
               document.getElementById("firstSite").value = sitesBeingTracked[0];
               document.getElementById("secondSite").value = sitesBeingTracked[1];
               document.getElementById("thirdSite").value = sitesBeingTracked[2];
               
        });
    } else {
        chrome.storage.local.get("trackData", function(result){
            var sitesBeingTracked = JSON.parse(result.trackData);
            var inputFieldIds = ["firstSite", "secondSite", "thirdSite"];
            var inputIdPos = 0;
            for(var i = 0 ; i < 5 ;i++){
                if(sitesBeingTracked[i] != "") {
                    document.getElementById(inputFieldIds[inputIdPos]).value = sitesBeingTracked[i];
                    inputIdPos++;
                }
            }
        });
    }

    displayFacebookAndTwitterTime();

    // Updates the visible time in real time 
    setInterval(function(){
         displayFacebookAndTwitterTime(); 
     }, 1000);

    // For the settings panel to become visible
    $('.settings').on('click', function(event){
        $('.settingsPanel').addClass('is-visible');
    });


    $('.settingsPanel').on('click', function(event){
        // This function registers click on the side panel
        if($(event.target).is('.done')) { 
            $('.editBtn').remove();
            if(chrome.extension.getBackgroundPage().isFirstRun){
                $('.settingsPanel').removeClass('is-visible');
            }

            var firstSiteBeingTracked = document.getElementById("firstSite").value;
            var secondSiteBeingTracked = document.getElementById("secondSite").value;
            var thirdSiteBeingTracked = document.getElementById("thirdSite").value;
            

            // Now whoever of them are not null we will need to push there value into the array
            var sitesBeingTracked = [firstSiteBeingTracked, secondSiteBeingTracked, thirdSiteBeingTracked];
            var sitesBeingTrackedStorable = JSON.stringify(sitesBeingTracked);
            chrome.storage.local.set({"trackData" : sitesBeingTrackedStorable}, function(){});
            chrome.extension.getBackgroundPage().isFirstRun = false;
            $('.tracksiteInput').removeClass('inputEnabled');
            $('.tracksiteInput').addClass('inputSaved');
            var delay = 300;
            setTimeout(function() {
                $('.tracksiteInput').removeClass('inputSaved');
            }, delay);
            $('.tracksiteInput').addClass('inputDisabled');
            $('.tracksiteInput').prop("disabled", true);
            $('.done').remove();
            $('.lockBtn').remove();
            $('.buttonsContainer').append("<img src = \"images/button_EDIT.png\" class = \"editBtn\">").on('click', function(){
                $('.tracksiteInput').prop("disabled", false);
                $('.tracksiteInput').removeClass('inputDisabled');
                $('.tracksiteInput').addClass("inputEnabled");
                $('.done').remove();
                $('.editBtn').remove();
                $('.lockBtn').remove();
                $('.buttonsContainer').append("<img src = \"images/button_LOCK.png\" class = \"lockBtn\"><img src = \"images/button_OK.png\" class = \"done\">");
            });

        }

        if($(event.target).is('.settingsPanel') && !chrome.extension.getBackgroundPage().isFirstRun) {
            chrome.storage.local.get("sitesLocked", function(result){
                if(!result.sitesLocked) {
                    $('.settingsPanel').removeClass('is-visible');
                    $('.editBtn').remove();
                    $('.tracksiteInput').removeClass('inputEnabled');
                    $('.tracksiteInput').addClass('inputDisabled');
                    $('.tracksiteInput').prop("disabled", true);
                    $('.done').remove();
                    $('.lockBtn').remove();
                    $('.buttonsContainer').append("<img src = \"images/button_EDIT.png\" class = \"editBtn\">").on('click', function(){
                        $('.tracksiteInput').prop("disabled", false);
                        $('.tracksiteInput').addClass("inputEnabled");
                        $('.done').remove();
                        $('.editBtn').remove();
                        $('.lockBtn').remove();
                        $('.buttonsContainer').append("<img src = \"images/button_LOCK.png\" class = \"lockBtn\"><img src = \"images/button_OK.png\" class = \"done\">");
                    });
                }else{
                    $('.settingsPanel').removeClass('is-visible');
                }

            });
        }

        if($(event.target).is('.lockBtn')) {
            vex.defaultOptions.className = 'vex-theme-top';
            vex.dialog.confirm({
                message: 'You sure? <br/> <br/> Clicking OK will permanently lock list of your choices, disallowing any further edits. <br/> You cannot undo this action.',
                callback : function(value){
                    if(value){
                        chrome.storage.local.set({"sitesLocked" : true}, function(){});
                        $('.editBtn').remove();
                        $('.lockBtn').remove();
                        $('.done').remove();
                        $('.tracksiteInput').removeClass("inputEnabled");
                        $('.tracksiteInput').addClass("inputDisabled");
                        $('.tracksiteInput').prop("disabled", true);
                    }
                }
            });
        }

        if($(event.target).is('.editBtn')){
            $('.tracksiteInput').prop("disabled", false);
            $('.tracksiteInput').removeClass('inputDisabled');
            $('.tracksiteInput').addClass("inputEnabled");
            $('.editBtn').remove();
            $('.lockBtn').remove();
            $('.done').remove();
            $('.buttonsContainer').append("<img src = \"images/button_LOCK.png\" class = \"lockBtn\"><img src = \"images/button_OK.png\" class = \"done\">");
        }
    });

    // Reposition the elements on the page
    var windowHeight = $(window).height();
    $(".container").css({
        "height" : windowHeight * 0.36,
        "margin-top" : windowHeight * 0.25
    });


    // Update the page with a random quote on each reload
    if(chrome.extension.getBackgroundPage().totalTimeOnWebsites > 0){
        
        var trackerDisplay = document.getElementById("websites");
        trackerDisplay.innerHTML = randomQuote;
    }else{
        var trackerDisplay = document.getElementById("websites");
        trackerDisplay.innerHTML = "going great!";
    }




    var forLabels = [];
    var forValues = [];
    // Get the data from the chrome local storage thing
    chrome.storage.local.get(null, function(extDatas){
        for(var prop in extDatas){
            if(prop.lastIndexOf("timeData", 0) === 0){
                forLabels.push(prop);
                forValues.push(extDatas[prop]);
            }
        }


        var barChartData = {
                labels : [].concat(forLabels),
                datasets : [
                    {
                        fillColor : "rgba(220,220,220,0.6)",
                        data : [].concat(forValues)
                    }
                ],

                getNumData : function(){
                    return Number(this.labels.length);
                }
        }

        var chartView = document.getElementById("myChart");
        var ctx = chartView.getContext("2d");
        window.myBar = new Chart(ctx).Bar(barChartData, {
            responsive : false,
            barShowStroke : false,
            scaleShowGridLines : false,
            showScale : false,
            showTooltips :false,
            barValueSpacing  : 13
        });

        var totalWidthBars = barWidth * barChartData.getNumData();
        var totalWidthSpacing = barSpacing * (barChartData.getNumData() - 1);
        var totalWidthChart = totalWidthBars + totalWidthSpacing;
        var left = ($(window).width() - totalWidthChart)/2;

        $("#myChart").css({
            "width": totalWidthChart,
            "height" : "50%",
            "left" : left
        });
    });


});

$(window).resize(function(){
    var totalWidthChart = $("#myChart").width();
    var left = ($(window).width() - totalWidthChart)/2;

    var windowHeight = $(window).height();
    var windowWidth  = $(window).width();

    $("#myChart").css({
        "width": totalWidthChart,
        "height" :  windowHeight * 0.5,
        "left" : left
    });

    $(".container").css({
        "height" : windowHeight * 0.36,
        "margin-top" : windowHeight * 0.25
    });
});

/*
* Function : displayFacebookAndTwitterTime();
* -------------------------------------------
* This function has a little name problem the thing is that this function
* shows the time for facebook twitter and google plus but due to 
* evolution over the times the name has stuck
*/
function displayFacebookAndTwitterTime() {
    var backgroundPage = chrome.extension.getBackgroundPage();
    if(backgroundPage != null){
        var totalTimeSpent = chrome.extension.getBackgroundPage().totalTimeOnWebsites;
        var div = document.getElementById("actualTime");
        div.innerHTML = getReadableTime(totalTimeSpent);
        var storageName = "timeData" + chrome.extension.getBackgroundPage().numDaysSinceUTC();
        var dataToBeWritten = {};
        dataToBeWritten[storageName] = totalTimeSpent;
        dataToBeWritten["today"] = chrome.extension.getBackgroundPage().numDaysSinceUTC();
        chrome.storage.local.set(dataToBeWritten, function(){});
    }
}

/*
* Function : getReadableTime();
* Usage : var readableTime = getReadableTime(2000);
* --------------------------------------------------
* This function takes in the number of seconds as arguments and then
* converts those number of seconds into hours and minutes respectively
* and returns a string that holds the proper time in the format of '3 hours 45 minutes and 3 seconds'
*/
function getReadableTime(totalSeconds) {
    var seconds = totalSeconds % 60;
    var minutes = (Math.floor(totalSeconds/60))%60;
    var hours = (Math.floor(totalSeconds/3600));
    var readableTime = '';
    if (hours > 1) 
        readableTime += hours + ' hours ';
    else if(hours == 1)
        readableTime += hours + ' hour '
    if (minutes > 1)
        readableTime += minutes + ' minutes and ' ;
    else if(minutes == 1)
        readableTime += minutes + ' minute and '
    if(seconds == 1){
        readableTime += seconds + ' second ';
    }else{
        readableTime += seconds + ' seconds ';
    }
    return readableTime;
}