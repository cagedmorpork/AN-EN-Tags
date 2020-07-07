var checkedTags = [];
var checkedTagsTL = [];

var globalOptStars = [];
var JsonDATA = {};

var langSettings = {
    gameRegion: 'cn',
    webLang: 'en',
};

var pageOptions = {
    isShowImages: true,
    isShowNames: true,
    isShowClass: false,
    size: 40,
};

init();

function localStorageDefaults() {
    // lang settings
    if (!localStorage.getItem('gameRegion') || !localStorage.getItem('webLang')) {
        localStorage.setItem("gameRegion", 'cn');
        localStorage.setItem("webLang", 'en');
    }

    // page options
    if (!localStorage.getItem('showImage')) {
        localStorage.setItem("showImage", JSON.stringify(true));
    }
    if (!localStorage.getItem('showName')) {
        localStorage.setItem("showName", JSON.stringify(true));
    }
    if (!localStorage.getItem('showClass')) {
        localStorage.setItem("showClass", JSON.stringify(false));
    }

    if (!localStorage.getItem('size')) {
        localStorage.setItem("size", 40);
    } else {
        if (!JSON.parse(localStorage.getItem('showName'))) {
            $("#showName").toggleClass("btn-primary btn-secondary");
        }
        if (!JSON.parse(localStorage.getItem('showImage'))) {
            $("#showImage").toggleClass("btn-primary btn-secondary");
        }
        if (!JSON.parse(localStorage.getItem('showClass'))) {
            $("#showClass").toggleClass("btn-primary btn-secondary");
        }
    }

    // last session chosen tags
    if (!localStorage.getItem('checkedTagsCache')) {
        localStorage.removeItem("checkedTagsCache");
        localStorage.removeItem("checkedTagsTLCache");
    }

}

function loadLocalStorageValues() {
    // should only be called after defaults have been stored
    langSettings.gameRegion = localStorage.getItem('gameRegion');
    langSettings.webLang = localStorage.getItem('webLang');

    pageOptions.isShowImages = JSON.parse(localStorage.getItem('showImage'));
    pageOptions.isShowNames = JSON.parse(localStorage.getItem('showName'));
    pageOptions.isShowClass = JSON.parse(localStorage.getItem('showClass'));
    pageOptions.size = JSON.parse(localStorage.getItem('size'));
}

async function init() {
    localStorageDefaults();
    loadLocalStorageValues();

    var tags_aval = {};
    var all_chars = {};
    var avg_char_tag = 0;
    const d0 = $.getJSON("json/tl-akhr.json", function (data) {
        let tag_count = 0;
        let char_tag_sum = 0;
        // console.log(data);

        // **** akhr.json contains all possible recruitment operators **** //
        $.each(data, function (_, char) {
            if (char.hidden) return;
            if (char.globalHidden && langSettings.gameRegion != "cn") return
            char.tags.push(char.type);
            if (langSettings.gameRegion == 'cn') {
                char.tags.push(char.sex + "性干员");
            } else {
                char.tags.push(char.sex);
            }
            $.each(char.tags, function (_, tag) {
                if (tag in tags_aval) {
                    tags_aval[tag].push({
                        "name_en": char.name_en,
                        "name": char['name_' + langSettings.gameRegion],
                        "name_tl": char['name_' + langSettings.webLang],
                        "level": char.level,
                        "type": char.type
                    });
                } else {
                    tags_aval[tag] = [{
                        "name_en": char.name_en,
                        "name": char['name_' + langSettings.gameRegion],
                        "name_tl": char['name_' + langSettings.webLang],
                        "level": char.level,
                        "type": char.type
                    }];
                    tag_count++;
                }
                char_tag_sum++;
            });
            all_chars[char.name_cn] = { 'name_cn': char.name_cn, 'name_en': char.name_en, 'name_jp': char.name_jp, 'name_kr': char.name_kr, 'level': char.level, 'tags': char.tags };
        });
        //$.each(tags_aval, function (key, _) {
        //    $("#box-tags").append(
        //        "<button type=\"button\" class=\"btn btn-sm btn-secondary btn-tag my-1\">" + key + "</button>\n"
        //    );
        //    tag_count++;
        //});
        //console.log(avg_char_tag);
        avg_char_tag = char_tag_sum / tag_count;

        JsonDATA.tags_aval = tags_aval;
        JsonDATA.all_chars = all_chars;
        JsonDATA.avg_char_tag = avg_char_tag;
    });
    const d1 = $.getJSON("json/tl-tags.json", function (data) {
        JsonDATA.tagsTL = data;
    });
    const d2 = $.getJSON("json/tl-type.json", function (data) {
        JsonDATA.typesTL = data;
    });
    const d3 = $.getJSON("json/tl-gender.json", function (data) {
        JsonDATA.gendersTL = data;
    });

    Promise.all([d0, d1, d2, d3]).then(() => {
        mutateDom();
    });
}

function mutateDom() {
    $('#to-tag').click(function () {      // When arrow is clicked
        $('body,html').animate({
            scrollTop: 0                       // Scroll to top of body
        }, 500);
    });

    $('.dropdown-trigger').dropdown();
    $('[data-toggle="tooltip"]').tooltip({
        trigger: "hover"
    });

    $('.reg[value=' + langSettings.gameRegion + ']').addClass('selected');
    $('.lang[value=' + langSettings.webLang + ']').addClass('selected');

    if (localStorage.getItem('checkedTagsCache')) {
        var checkedTagsCache = JSON.parse(localStorage.getItem('checkedTagsCache'))
        var checkedTagsTLCache = JSON.parse(localStorage.getItem('checkedTagsTLCache'))
        if (checkedTagsCache.length != 0) {
            $.each(checkedTagsCache, function (i, v) {
                $('.button-tag').each(function () {
                    let cntext = $(this).attr('cn-text');
                    if (cntext && cntext == checkedTagsCache[i]) {
                        $(this).trigger('click');
                    }
                })
            });
            // calculate();
        }
    }

    // ---- page options ---- //
    console.log("Show Name: ", pageOptions.isShowNames);
    console.log("Show Image: ", pageOptions.isShowImages);
    console.log("Show Class: ", pageOptions.isShowClass);

    updateImageSizeDropdownList(pageOptions.size);

    $(document).on("click", ".btn-name", function () {
        pageOptions.isShowNames = !pageOptions.isShowNames;
        localStorage.setItem('showName', JSON.stringify(pageOptions.isShowNames));
        console.log("Show Name: ", pageOptions.isShowNames);
    })
    $(document).on("click", ".btn-class", function () {
        pageOptions.isShowClass = !pageOptions.isShowClass;
        localStorage.setItem('showClass', JSON.stringify(pageOptions.isShowClass));
        console.log("Show Class: ", pageOptions.isShowClass);
    })
    $(document).on("click", ".btn-image:not(.disabled)", function () {
        pageOptions.isShowImages = !pageOptions.isShowImages;
        localStorage.setItem('showImage', JSON.stringify(pageOptions.isShowImages));
        console.log("Show Image: ", pageOptions.isShowImages);
    });
    changeUILanguage(true);
};

$('#fastInput').click(function (event) {
    event.stopPropagation();
});

$('#fastInput').keyup(function (e) {
    if (e.keyCode == 13) $('#fastInput').trigger("enterKey");
    if (e.keyCode == 27) clickBtnClear()
});

$('#fastInput').bind("enterKey", function (e) {

    CheckTag($('#fastInput'), true)
});
function regDropdown(el) {
    langSettings.gameRegion = el.attr("value");
    localStorage.setItem('gameRegion', langSettings.gameRegion);
    $(".dropdown-item.reg").removeClass("selected");
    el.addClass("selected");
    changeUILanguage(true);
}

function langDropdown(el) {
    langSettings.webLang = el.attr("value");
    localStorage.setItem('webLang', langSettings.webLang);
    console.log("language : " + localStorage.getItem('webLang'))
    $(".dropdown-item.lang").removeClass("selected");
    el.addClass("selected");
    changeUILanguage(true);
}




//var global = this;


function showChar(el) {
    // let reg = $('.reg[value='+reg+']').attr("value");
    // let lang =$('.lang[value='+lang+']').attr("value");
    let all_chars = JsonDATA.all_chars;
    let all_tags = JsonDATA.tagsTL;
    let all_types = JsonDATA.typesTL;
    let all_genders = JsonDATA.gendersTL;
    let char_name = $(el).attr('data-original-title');

    // console.log(JsonDATA.all_chars)

    if (langSettings.gameRegion != "cn") {
        Object.keys(all_chars).forEach(currkey => {
            if (all_chars[currkey]["name_" + langSettings.gameRegion] == char_name) {
                char_name = all_chars[currkey]["name_cn"]
            }
        });
    }



    console.log(all_tags);
    //console.log(all_chars);
    console.log("char name: " + char_name);
    $(".tr-recommd").show();
    $(".tr-chartag").remove();
    if (localStorage.getItem('lastChar') != char_name) {
        $(".tr-recommd:not(:contains('" + $(el).text() + "'))").hide();
        let char = all_chars[char_name];
        let colors = { 1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6" };
        //console.log(char)
        let tags_html = [];
        $.each(char.tags, function (_, tag) {
            console.log(tag);
            var found = false;
            $.each(all_tags, function (_, alltag) {
                if (alltag.tag_cn == tag) {
                    tagReg = alltag['tag_' + langSettings.gameRegion];
                    tagTL = alltag['tag_' + langSettings.webLang];
                    found = true;
                    return false;
                }
            });
            if (!found) {
                $.each(all_types, function (_, alltypes) {
                    if (alltypes.type_cn == tag) {
                        tagReg = alltypes['type_' + langSettings.gameRegion] + (pageOptions.isShowClass && langSettings.gameRegion == "cn" ? "干员" : "");
                        tagTL = alltypes['type_' + langSettings.webLang];
                        found = true;
                        return false;
                    }
                })
                if (!found) {
                    $.each(all_genders, function (_, allgenders) {
                        console.log(allgenders);
                        if (allgenders.sex_cn + '性干员' == tag) {
                            tagReg = allgenders['sex_' + langSettings.gameRegion];
                            tagTL = allgenders['sex_' + langSettings.webLang];
                            if (langSettings.gameRegion == 'cn') {
                                tagReg = tagReg + '性干员';
                            }
                            if (langSettings.webLang == 'cn') {
                                tagTL = tagTL + '性干员';
                            }
                            found = true;
                            return false;
                        }
                    })
                }
            }
            if (found) {
                tags_html.push("<button type=\"button\" class=\"btn btn-sm ak-shadow-small ak-btn btn-secondary btn-char my-1\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"" + tagReg + "\">" +
                    (tagReg == tagTL ? "" : '<a class="ak-subtitle2" style="font-size:11px;margin-left:-9px;margin-bottom:-15px">' + tagReg + '</a>') + tagTL + "</button>\n")
            }
        });
        console.log("Region : " + langSettings.gameRegion)
        $("#tbody-recommend").append(
            "<tr class=\"tr-chartag \"><td>#</td><td>" +
            "<button type=\"button\" class=\"btn btn-sm ak-btn ak-shadow-small ak-rare-" + colors[char.level] +
            " btn-char my-1\" data-toggle=\"tooltip\" data-placement=\"right\" title=\"" + char["name_" + langSettings.gameRegion] + "\" onclick=\"showChar(this)\">" + char["name_" + langSettings.webLang] + "</button>\n" +
            "<a type=\"button\" class=\"btn btn-sm ak-btn ak-shadow-small my-1\" style=\"background:#444\"data-toggle=\"tooltip\" data-placement=\"right\" href=\"./akhrchars.html?opname=" + char.name_en.replace(/ /g, "_") + "\" \">Detail</button></td><td>" + tags_html.join("") + ""
            // "</td><td>#</td>" 
            + "</tr>"
        );

        $('[data-toggle="tooltip"]').tooltip({
            trigger: "hover"
        });
        localStorage.setItem('lastChar', char_name)
    } else {
        $(".tr-chartag").remove();
        localStorage.removeItem('lastChar')
        // setTimeout(function(){
        //     showChar(el);
        // }, 200);
    }
}

function clickBtnClear() {

    $('.btn-tag').removeClass('btn-primary').addClass('btn-secondary');
    $("#tbody-recommend").empty();
    $("#count-tag").empty()
    checkedTags = [];
    checkedTagsTL = [];
    localStorage.removeItem('checkedTagsCache');
    localStorage.removeItem('checkedTagsTLCache');
    localStorage.removeItem('lastChar');
}

function updateImageSizeDropdownList(size) {
    size = parseInt(size);
    $("#selectedImageSize").text(size);
    $(".imagesizeselect").each(function () {
        var itemSize = parseInt($(this).attr("title"));
        if (itemSize === size) {
            $(this).addClass("active");
        } else {
            $(this).removeClass("active");
        }
    });
    pageOptions.size = size;
    localStorage.setItem('size', JSON.stringify(size));
}

function changeImageSize(el) {
    let size = $(el).attr('title');
    updateImageSizeDropdownList(size);
    calculate();
}

function clickBtnOpt(el) {
    $(el).toggleClass("btn-primary btn-secondary");
    let checked = $(el).hasClass("btn-primary");
    if ($(el).attr("id") === "opt-all") {
        $(".btn-opt").removeClass("btn-primary btn-secondary").addClass(
            checked ? "btn-primary" : "btn-secondary"
        );
    } else {
        if ($("#opt-all").hasClass("btn-primary")) {
            $("#opt-all").toggleClass("btn-primary btn-secondary");
        } else {
            // console.log("checked count:", checkedCount);
            let checkedCount = $(".btn-opt.btn-primary:not(#opt-all)").length;
            if (checkedCount === 6) $("#opt-all").toggleClass("btn-primary btn-secondary");
        }
    }
    globalOptStars = [];
    $(".btn-opt.btn-primary:not(#opt-id)").each(function (_, __) {
        globalOptStars.push($(this).attr("opt-id"));
    });

    // console.log("opstars:", globalOptStars);

    calculate();
}

function clickBtnOpt2(el) {
    $(el).toggleClass("btn-primary btn-secondary");
    localStorage.removeItem('lastChar')
    calculate();
}
function clickBtnOpt3(el) {
    $(el).toggleClass("btn-primary btn-secondary");
    localStorage.removeItem('lastChar')
    changeUILanguage(el);
}

function clickBtnTag(el) {
    let checked = $(el).hasClass("btn-primary");
    let tag = $(el).attr('cn-text');
    let tagTL = $(el).attr('data-original-title');
    let tagEN
    if (checked) {
        checkedTags = checkedTags.filter(function (v, _, __) {
            return v !== tag;
        });
        checkedTagsTL = checkedTagsTL.filter(function (v, _, __) {
            return v !== tagTL;
        });
    } else {
        if (checkedTags.length >= 6) {
            // alert("Only 6 tags max");

            return;
        } else {
            if (checkedTags.length != 0) {
                let found = 0;
                $.each(checkedTags, function (_, v) {
                    if (v == tag) {
                        found = 1;
                    }
                });
                if (found == 0) {
                    checkedTags.push(tag);
                    checkedTagsTL.push(tagTL);
                }
            } else {
                checkedTags.push(tag);
                checkedTagsTL.push(tagTL);
            }
        }
    }
    $(el).toggleClass("btn-primary btn-secondary");

    if ($(el).hasClass("btn-primary")) {
        let all_tags = JsonDATA.tagsTL.concat(JsonDATA.typesTL);
        var currtags = all_tags.find(search => {
            var checktags = search.type_cn ? search.type_cn : search.tag_cn
            if (checktags == tag) return true
        })
        currtags = currtags ? currtags.type_en ? currtags.type_en : currtags.tag_en : undefined
        // console.log(currtags)   
        if (currtags) {
            gtag('event', 'Selecting Tags (Crude)', {
                'event_category': 'Recruitment Calculator',
                'event_label': currtags
            });
            if (checkedTags.length == 5) {
                // console.log("5 Combinations !")  
                var combination = []
                checkedTags.forEach(element => {
                    var currtags = all_tags.find(search => {
                        var checktags = search.type_cn ? search.type_cn : search.tag_cn
                        if (checktags == element) return true
                    })
                    currtags = currtags ? currtags.type_en ? currtags.type_en : currtags.tag_en : undefined
                    combination.push(currtags)
                });
                // console.log(combination)
                combination = combination.sort((a, b) => {
                    if (a > b) return 1
                    else if (a < b) return -1
                    else return 0
                })
                // console.log(combination.join(",") )
                gtag('event', 'Tags Combinations (Crude)', {
                    'event_category': 'Recruitment Calculator',
                    'event_label': combination.join(",")
                });

            }
        }
    }
    localStorage.removeItem('lastChar')
    localStorage.setItem('checkedTagsCache', JSON.stringify(checkedTags));
    localStorage.setItem('checkedTagsTLCache', JSON.stringify(checkedTagsTL));
    calculate();
}


function calculate() {
    // console.log(checkedTags)
    // console.log(JsonDATA)
    if (typeof checkedTags !== 'undefined') {
        //console.log(JsonDATA);
        let tags_aval = JsonDATA.tags_aval;
        let all_chars = JsonDATA.all_chars;
        let avg_char_tag = JsonDATA.avg_char_tag;
        let all_tags = JsonDATA.tagsTL.concat(JsonDATA.typesTL);
        let len = checkedTags.length;
        let count = Math.pow(2, checkedTags.length);
        $("#count-tag").html(checkedTags.length >= 1 ? checkedTags.length == 6 ? "6 [MAX]" : checkedTags.length : "")

        // console.log(all_chars)
        let combs = [];
        for (let i = 0; i < count; i++) {
            let ts = [];
            let tstl = [];
            for (let j = 0, mask = 1; j < len; j++) {
                if ((i & mask) !== 0) {
                    ts.push(checkedTags[j]);
                    tstl.push(checkedTagsTL[j]);

                    // console.log(checkedTags[j]);
                }
                mask = mask * 2;
            }
            combs.push({ "tags": ts, "tagsSource": [], "tagsTL": tstl, "score": 0.0, "possible": [] });
        }
        // console.log(combs);
        $("#tbody-recommend").empty();
        $.each(combs, function (_, comb) {
            let tags = comb.tags;

            // let anotag = tags.map(tagextra => {
            //     let currtag = tagextra
            //    if(JsonDATA.typesTL.find(search=>search.type_cn==tagextra)){
            //        console.log(tagextra)
            //        currtag = tagextra+(JSON.parse(localStorage.getItem('showClass'))?"干员":"")
            //    }
            //    return currtag
            // });

            // tags = anotag
            // console.log(anotag)
            if (tags.length === 0 || tags.length > 3) return;
            let chars = [...tags_aval[tags[0]]];
            for (let i = 1; i < tags.length; i++) {
                let reduced_chars = [];
                $.each(chars, function (_, char) {
                    // console.log(tags_aval[tags[i]]);
                    // console.log(char);
                    $.each(tags_aval[tags[i]], function (_, tgch) {
                        if (char.name === tgch.name) {
                            reduced_chars.push(char);
                            return false;
                        }
                    });
                });
                chars = reduced_chars;
            }

            let optStars = globalOptStars;
            if (optStars.length == 0) {
                $(".btn-opt.btn-primary:not(#opt-id)").each(function (_, __) {
                    optStars.push($(this).attr("opt-id"));
                });
            }

            if (chars.length === 0) return;
            if (!tags.includes("高级资深干员")) {
                // console.log(tags.join(",") + " 不含(高级)资深干员");
                let reduce6 = [];
                $.each(chars, function (_, char) {
                    if (char.level !== 6) {
                        reduce6.push(char);
                    }
                });
                chars = reduce6;
            }
            // console.log(chars)
            let filtered_chars = [];
            $.each(chars, function (_, char) {
                //console.log(char.level);
                if (optStars.includes(char.level.toString())) {
                    filtered_chars.push(char);
                }
            });
            // console.log(filtered_chars)
            chars = filtered_chars;
            comb.possible = chars;
            if (chars.length === 0) return;
            let s = 0;
            $.each(chars, (_, char) => {
                s += char.level;
                // console.log(char)
            });
            s = s / chars.length;
            comb.score = s - tags.length / 10 - chars.length / avg_char_tag;
            //console.log("tags length = "+tags.length);
            //console.log("chars length = "+chars.length);
            // console.log("avg char tag = "+avg_char_tag);
            //console.log("score = "+comb.score);
        });
        combs.sort(function (a, b) {
            return a.score > b.score ? -1 : (a.score < b.score ? 1 :
                (a.tags.length > b.tags.length ? 1 : (a.tags.length < b.tags.length ? -1 : 0)));
        });
        let no = 1;
        // console.log(combs)
        $.each(combs, function (_, comb) {
            if (comb.possible.length === 0) return;
            let chars = comb.possible;
            let tags = comb.tags;
            let tagsTL = comb.tagsTL
            let anotag = tags.map(tagextra => {
                let currtag = tagextra
                if (JsonDATA.typesTL.find(search => search.type_cn == tagextra)) {

                    currtag = tagextra + (pageOptions.isShowClass ? "干员" : "")
                }
                return currtag
            });
            tags = anotag
            let chars_html = [];
            let colors = { 1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6" };
            comb.possible.sort(function (a, b) {
                return a.level > b.level ? -1 : (a.level < b.level ? 1 : 0);
            });
            $.each(chars, function (_, char) {
                let padding = pageOptions.isShowNames && pageOptions.size < 60 ? "padding-right: 8px" : "padding-right: 1px";
                let style = pageOptions.isShowImages ? "style=\"padding: 1px 1px;" + padding + ";\" " : "";
                let buttonstyle = pageOptions.size > 25 ? "background-color: #AAA" : "background-color: transparent";
                chars_html.push("<button type=\"button\" class=\" ak-shadow-small ak-btn btn btn-sm ak-rare-" + colors[char.level] + " btn-char my-1\" data-toggle=\"tooltip\" data-placement=\"bottom\" onclick=\"showChar(this)\" " + style + "title=\"" + char.name + "\">");
                if (pageOptions.isShowImages) chars_html.push("<img style=\"" + buttonstyle + "\"height=\"" + pageOptions.size + "\" width=\"" + pageOptions.size + "\" src=\"./img/chara/" + char.name_en + ".png\">   ")
                if (pageOptions.size > 60) chars_html.push("<div>")
                if (pageOptions.isShowNames) chars_html.push(char.name_tl)
                if (pageOptions.size > 60) chars_html.push("</div>")
                chars_html.push("</button>\n")
            });
            let tags_html = [];
            // console.log(tags)
            // console.log(tagsTL)
            // console.log(all_tags)

            $.each(tags, function (_, tag) {
                tags_html.push("<button type=\"button\" class=\"btn btn-sm ak-btn btn-secondary btn-char my-1\">" +
                    tag + "</button>\n")
            });
            let tagsTL_html = [];
            $.each(tagsTL, function (i, tagTL) {
                // console.log(tags[i])
                var currtags = all_tags.find(search => {
                    var checkcurr
                    if (pageOptions.isShowClass && search.type_cn + "干员" == tags[i]) checkcurr = true
                    else if (!pageOptions.isShowClass && search.type_cn == tags[i]) checkcurr = true
                    else checkcurr = search.tag_cn == tags[i]
                    return checkcurr
                })
                // console.log(currtags)
                var currtagtrailreg = langSettings.gameRegion == "cn" ? "干员" : langSettings.gameRegion == "jp" ? "タイプ" : ""
                var currtagtraillang = langSettings.webLang == "cn" ? "干员" : langSettings.webLang == "jp" ? "タイプ" : ""
                var currtag = currtags["type_" + langSettings.gameRegion] ? pageOptions.isShowClass ? currtags["type_" + langSettings.gameRegion] + currtagtrailreg : currtags["type_" + langSettings.gameRegion]
                    : currtags["tag_" + langSettings.gameRegion]
                var currtagtl = currtags["type_" + langSettings.webLang] ? pageOptions.isShowClass ? currtags["type_" + langSettings.webLang] + currtagtraillang : currtags["type_" + langSettings.webLang]
                    : currtags["tag_" + langSettings.webLang]
                tagsTL_html.push("<button type=\"button\" class=\"btn btn-sm ak-btn btn-secondary btn-char my-1\" data-toggle=\"tooltip\" data-placement=\"right\" title=\"" + tags[i] + "\">" +
                    (currtag == currtagtl ? "" : '<a class="ak-subtitle2" style="font-size:11px;margin-left:-9px;margin-top:-15px">' + currtag + '</a>') + currtagtl + "</button>\n")
            });
            $("#tbody-recommend").append(
                "<tr class=\"tr-recommd\"><td>" + no++ + "</td><td>" + tagsTL_html.join("") + "</td><td>" + chars_html.join("") +
                "</td>" + "" + "</tr>"
            );
        });
        $('[data-toggle="tooltip"]').tooltip({
            trigger: "hover"
        });
    }
}

function CheckTag(el, isenter = false) {
    // console.log($(el).val())
    console.log(isenter)

    var currsearch = $(el).val()

    console.log(currsearch)
    if (currsearch) {
        let all_tags = JsonDATA.tagsTL.concat(JsonDATA.typesTL);
        var allsearch = all_tags.reduce((acc, element) => {
            Object.entries(element).forEach(([k, v]) => {
                if (/(type|tag)_(cn|en|kr|jp)/.test(k) && v.toLowerCase().includes(currsearch.toLowerCase())) {
                    if (!acc.some(search => search[1] == element)) {
                        acc.push([v, element]);
                    }
                }
            });
            return acc;
        }, []);
        if (isenter) {
            if (allsearch.length > 0) {
                let firstTag = allsearch[0][1];
                console.log(firstTag)
                var currtag = firstTag['tag_' + langSettings.webLang] ? firstTag['tag_' + langSettings.webLang] : firstTag['type_' + langSettings.webLang]
                console.log(`button[data-original-title='${currtag}']`)
                console.log($(`button[data-original-title='${currtag}']`))
                clickBtnTag($(`button[data-original-title='${currtag}']`)[0])
                $('#fastInput').val("")
            }
        } else {
            console.log(allsearch)
        }


    }
}


function changeUILanguage(calc = false) {
    $('#display-reg').text(langSettings.gameRegion.toUpperCase());
    switch (langSettings.webLang) {
        case "en": $('#display-lang').text("English"); console.log('English'); break;
        case "cn": $('#display-lang').html("Chinese"); console.log('Chinese'); break;
        case "jp": $('#display-lang').text("Japanese"); console.log('Japanese'); break;
        case "kr": $('#display-lang').text("Korean"); console.log('Japanese'); break;
    }

    let types = ["qualifications", "position", "affix"];
    for (let m = 0; m < types.length; m++) {
        $(".tags-" + types[m]).each(function (j, el) {
            let data = JsonDATA.tagsTL
            if (data.length != 0) {
                let k = 0;
                for (var i = 0; i < data.length; i++) {
                    if (data[i].type == types[m]) {
                        //console.log("j="+j+" , k="+k);
                        if (j == k) {
                            $(el).html(data[i]["tag_" + langSettings.gameRegion]);
                            $(el).attr("data-original-title", data[i]["tag_" + langSettings.webLang]);
                        }
                        k++;
                    }
                }
            }
        });
    }
    $(".tags-gender").each(function (i, el) {
        let data = JsonDATA.gendersTL
        if (data.length != 0) {
            if (langSettings.gameRegion == 'cn') {
                $(el).html(data[i]["sex_" + langSettings.gameRegion] + '性干员');
            } else {
                $(el).html(data[i]["sex_" + langSettings.gameRegion]);
            }
            $(el).attr("data-original-title", data[i]["sex_" + langSettings.webLang]);
        }
    });
    $(".tags-class").each(function (i, el) {
        let data = JsonDATA.typesTL
        if (data.length != 0) {
            $(el).attr("data-original-title", data[i]["type_" + langSettings.webLang]);
        }
        $(el).html(data[i]["type_" + langSettings.gameRegion] + (pageOptions.isShowClass ? langSettings.gameRegion == 'cn' ? '干员' : langSettings.gameRegion == 'jp' ? "タイプ" : "" : ""));
    });
    getJSONdata("ui", function (data) {
        if (data.length != 0) {
            $.each(data, function (i, text) {
                // console.log(text)
                $("[translate-id=" + text.id).html(text['ui_' + langSettings.webLang]);
            });
        }
    });
    console.log("done");

    if (calc) {
        calculate();
    }
}

function getJSONdata(type, callback) {
    var x = 0;
    var req = $.getJSON("json/tl-" + type + ".json");
    req.done(function (response) {
        callback(response);
    });
    req.fail(function (response) {
        console.log("type: " + type + " fail: ");
        console.log(response);
    });
}

function doubleclick(el) {
    setTimeout(function () {
        $(el).click();
    }, 200);
    $(el).click();
}
