$(document).ready(function(){
    updateTime();
    setInterval(updateTime, 1000);
})

function updateTime() {
    var curDate = new Date();
    $("#status-bar .left .time").html(new Date().toString().slice(16,21));
}

$( "#phone-screen" ).scroll(function() {
    if ($(this).scrollTop() > 20) {
        if (!$(".profile .name").hasClass("minimized")) {
            $(".profile .name").addClass("minimized")
        }
    } else {
        if ($(".profile .name").hasClass("minimized")) {
            $(".profile .name").removeClass("minimized")
        }
    }
});

$.getJSON('./profiles.json', function(profiles) {
    var first_profile = profiles.shift();
    showProfile(first_profile);
    $("#decide button").click(function() {
        $(".profile").addClass($(this).attr("data-swipe"));
        setTimeout(function() {
            var next_profile = profiles.shift();
            if (next_profile != undefined) {
                showProfile(next_profile);
                $( "#phone-screen" ).scrollTop(0);
            } else {
                $(".profile").html(`
                <div id="sorry">Looks like you're all out of swipes :(<br /><br />Maybe look at the matches you have below or reload to see the profiles again!</div>
                `);
                $("#decide button").prop("disabled", true);
            }
            $(".profile").css("transition", "transform 0s, opacity .5s");
            $(".profile").removeClass(["like", "dislike"]);
            setTimeout(function(){
                $(".profile").css("transition", "transform .5s, opacity .5s");
            }, 50);
        }, 500);
    });
});

$.getJSON("./messages.json", function(messageData){
    for (const [idx, curChat] of messageData.entries()) {
        var last_msg = curChat.messages[curChat.messages.length - 1].content;
        var participants = curChat.participants;
        var item = `<li data-chat="${idx}">` +
            `<div class="chat-img-group">` +
                `<div class="chat-img-left" style="background-image:url('${participants[1].picture}')"></div>` +
                `<div class="chat-img-right" style="background-image:url('${participants[0].picture}')"></div>` +
            `</div>` + 
            `<div class="chat-text">` +
                `<div class="chat-name">${curChat.participants[1].name + " - " + curChat.participants[0].name}</div>` +
                `<div class="chat-preview">${last_msg}</div>` +
            `</div>` +
        `</li>`;
        $("#chat-list").append(item);
    }
    $("#chat-list li").click(function(){
        var chatID = $(this).attr("data-chat");
        var curChat = messageData[chatID];
        var participants = curChat.participants;
        $(".chat").attr("data-mode", "chat-individual");
        $("#chat-headline-text").html(curChat.name);
        var messageHTML = ``;
        for (const message of curChat.messages) {
            var picture = participants[message.from].picture;
            if (message.from == 0) {
                messageHTML += `
                <li class="from0">
                    <div class="chat-message-content">
                        <span class="chat-message-content-sub">${message.content}</span>
                    </div>
                    <div class="chat-message-pic" style="background-image:url(${picture})"></div>
                </li>
                `
            } else {
                messageHTML += `
                <li class="from1">
                    <div class="chat-message-pic" style="background-image:url(${picture})"></div>
                    <div class="chat-message-content">
                        <span class="chat-message-content-sub">${message.content}</span>
                    </div>
                </li>
                `
            }
        }
        $("#chat-individual").html(messageHTML);
    });
});

function showProfile(profile) {
    var output = `<div class="name">${profile.name}</div>` +
     `<div class="profile-pic card" style="background-image:url('${profile.picture}')"></div>` +
     `<div class="biodata card"><div class="first-line"><div class="first-line-inner">`;
    
    for (const item of profile.biodata.intro) {
        output += `<div class="${item}">${profile.biodata[item]}</div>`;
    }
    output += `</div><div class="first-line-edge"></div></div>`;
    
    for (const item of profile.biodata.other) {
        output += `<div class="${item}">${profile.biodata[item]}</div>`;
    }
    output += `</div>`;
    for (const prompt_item of profile.prompts) {
        var pr_size = (prompt_item.response.length > 120) ? "big-text" : "";
        console.log(pr_size);
        output += `<div class="prompt card">` +
         `<div class="prompt-title">${prompt_item.prompt}</div>` +
         `<div class="prompt-text ${pr_size}">${prompt_item.response}</div>` +
         `</div>`
    }
    $(".profile").html(output);
}

$("#appbar button").click(function(){
    if ($(this).prop("disabled") == false) {
        $("#appbar button:disabled").prop("disabled", false);
        $(this).prop("disabled", true);
        $("#phone-screen .tab.visible").removeClass("visible");
        $(`#phone-screen .tab.${$(this).attr("data-tab")}`).addClass("visible");
        $("#phone-outline").attr("data-tab", $(this).attr("data-tab"));
    }
});

$("#chat-back").click(function(){
    $(".chat").attr("data-mode", "chat-list");
    $("#chat-headline-text").html("Conversations");
});