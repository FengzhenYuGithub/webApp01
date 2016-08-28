/**
 * Created by fzy on 2016-08-28.
 */
(function(){
    /*工具方法localStorage*/
    var Util=(function(){
        var prefix='html5_reader_';
        var StorageGetter=function(key){
            return localStorage.getItem(prefix+key);
        };
        var StorageSetter=function(key,val){
            return localStorage.setItem(prefix+key,val);
        };
        //获取json
        var getBSON=function(url,callback){
            return $.jsonp({
                url:url,
                cache:true,//缓存
                callback:'duokan_fiction_chapter',
                success:function(result){
                    //console.log(result) base64
                    var data=$.base64.decode(result);
                    //console.log(data)
                    var json=decodeURIComponent(escape(data));
                    console.log(escape(data))
                    callback(json);
                    //console.log(json);
                }
            })
        };
        return{
            getBSON:getBSON,
            StorageGetter:StorageGetter,
            StorageSetter:StorageSetter
        }
    })();
    var Dom={
        mid_action:$('#mid_action'),
        footer:$('#footer'),
        footer_shadow:$('#footer_shadow'),
        font_bar:$('#font_bar'),
        font_bar_shadow:$('#font_bar_shadow'),
        public_top:$('#public_top'),
        m_content:$('#m_content'),
        win:$(window),
        font:$('#font'),
        body:$('body'),
        uTab:$('#u_tab'),
        uTabChild:$('#u_tab').children(),
        fail:$("fail")
    };
    //画一下基本的展示框架
    function RenderBaseFrame(container) {

        function parseChapterData(jsonData) {
            //console.log(jsonData);
            var jsonObj = JSON.parse(jsonData);
            var html = "<h4>" + jsonObj.t + "</h4>";
            for (var i = 0; i < jsonObj.p.length; i++) {
                html += "<p>" + jsonObj.p[i] + "</p>";
            }
            return html;

        }

        return function(data) {
            container.html(parseChapterData(data));

        };
    }

    //初始化的字体大小
    var InitFontSize;
    //字体设置信息
    InitFontSize = Util.StorageGetter('font_size');
    InitFontSize = parseInt(InitFontSize);
    if (!InitFontSize) {
        InitFontSize = 14;
    }
    Dom.m_content.css('font-size', InitFontSize);
    Util.StorageSetter('font_size',InitFontSize);

    /*设置默认背景颜色*/
    var bg ;//默认body 背景颜色
    var m_content_Color;//默认主题文字颜色
    var index;

    var nightText; //夜间和白天的记录
    var iconNight_Day;

    index=Util.StorageGetter('index');
    if(!index){
        index=0;
    }
    $('#bgMod').children('.bk-container').eq(index).children().show();
    Util.StorageSetter('index',index);



    nightText=Util.StorageGetter('nightText');
    if(!nightText){
        nightText='夜间';
    }
    $('#day_night').children('.icon-text').text(nightText);

    Util.StorageSetter('nightText',nightText);


    iconNight_Day=Util.StorageGetter('iconNight_Day');
    if(!iconNight_Day){
        iconNight_Day='icon-night'
    }
    $('#day_night').children('.icon-night').attr('class',iconNight_Day);
    Util.StorageSetter('iconNight_Day',iconNight_Day);



    bg=Util.StorageGetter('bg');
    if(!bg){
        bg='#e9dfc7';
    }
    Dom.body.css('background-color',bg);
    Util.StorageSetter('bg',bg);


    m_content_Color=Util.StorageGetter('m_content_Color');
    if(!m_content_Color){
        m_content_Color='';
    }
    Dom.m_content.css('color',m_content_Color);
    Util.StorageSetter('m_content_Color',m_content_Color);
    var readerModel;
    var readerUI;
//项目入口函数
    function main(){
        readerModel=ReaderModel();//建立模型
        readerUI=ReaderBaseFrame(Dom.m_content);
        readerModel.init(function(data){  //初始化数据
            readerUI(data);
            $('#u_tab').show();
        });


        EventHandler();
    }
//获取数据
    function ReaderModel(){
        //实现和阅读器相关的数据交互的方法
        var Chapter_id;
        var ChapterTotal;
        //初始化函数
        var init=function(Uicallback){
            getFictionInfo(function(){
                getCurChapterContent(Chapter_id,function(data){
                    //返回得到的json数据 回调函数返回json 数据
                    Uicallback && Uicallback(data);
                });
            });
        };
        //获得章节的Chapter_id 和 ChapterTotal
        var getFictionInfo=function(callback){
            $.get('data/chapter.json',function(data){
                Chapter_id=Util.StorageGetter("Chapter_id")||1;//设置Chapter_id 从本地存储拿,不存在则设为1
                ChapterTotal=data.chapters.length;

                console.log(ChapterTotal);
                callback && callback();

            },'json');
        };

        //获得章节的URl和json
        var getCurChapterContent=function(chapter_id,callback){
            $.ajax({
                type:"GET",
                url:'data/data'+chapter_id+'.json',
                dataType: 'json',
                success:function(data){
                    if(data.result==0){
                        var url=data.jsonp;
                        console.log(typeof url)
                        console.log(data)
                        Util.getBSON(url,function(data){
                            callback && callback(data);
                        });
                    }
                },
                error: function(){
                    Chapter_id-=1
                    Dom.fail.show();
                }
            })
        };
        //上一页
        var prevChapter=function(Uicallback){
            Chapter_id=parseInt(Chapter_id,10);
            if(Chapter_id==0){
                return;
            }
            Chapter_id-=1;
            getCurChapterContent(Chapter_id,Uicallback);
            Util.StorageSetter("Chapter_id",Chapter_id);//保存当前的Chapter_id 章节
        };
        //下一页
        var nextChapter=function(Uicallback){
            Chapter_id=parseInt(Chapter_id,10);
            if(Chapter_id==ChapterTotal){
                return;
            }
            Chapter_id += 1;
            getCurChapterContent(Chapter_id,Uicallback);
            Util.StorageSetter("Chapter_id",Chapter_id);//保存当前的Chapter_id 章节
        };


        return {
            init:init,
            prevChapter:prevChapter,
            nextChapter:nextChapter,
        }

    }

//渲染ui结构
    function ReaderBaseFrame(container){
        function parseChapterData(jsonData){
            var jsonObj=JSON.parse(jsonData);/* json (JSON) 字符串转换为对象。*/
            var html="<h4>"+jsonObj.t+"</h4>";
            for(var i=0;i<jsonObj.p.length;i++){
                html+="<p>"+jsonObj.p[i]+"</p>";
            }
            return html;
        }
        return function(data){

            container.html(parseChapterData(data))

        }

    }
//交互事件绑定
    function EventHandler(){
        //字体和背景的颜色表
        var colorArr = [{
            bgValue : '#f7eee5',
            font : '#333'
        }, {
            bgValue : '#e9dfc7',
            font : '',
        }, {
            bgValue : '#a4a4a4',
            font : '#333'
        }, {
            bgValue : '#cdefce',
            font : '#000'
        }, {
            bgValue : '#283548',
            font : '#7685a2'
        }, {
            bgValue : '#0f1410',
            font : '#4e534f'
        }];
        $('#bgMod').children('.bk-container').click(function(){
            $(this).find('.bk-container-current').show().parent().siblings().find('.bk-container-current').hide();
            var index=$(this).index();
            Util.StorageSetter('index',index-1);
            var colorVal=colorArr[index-1];
            Dom.body.css('background-color',colorVal.bgValue);
            Util.StorageSetter('bg',colorVal.bgValue);
            Dom.m_content.css('color',colorVal.font);
            Util.StorageSetter('m_content_Color',colorVal.font);
        });



        Dom.mid_action.click(function(){
            if(Dom.public_top.css('display')=='none'){
                Dom.public_top.show();
                Dom.footer.show();
                Dom.footer_shadow.show();
            }else{
                Dom.public_top.hide();
                Dom.footer.hide();
                Dom.footer_shadow.hide();
                Dom.font_bar.hide();
                Dom.font_bar_shadow.hide();
            }
        });

        Dom.win.on('scroll',function(){
            Dom.public_top.hide();
            Dom.footer.hide();
            Dom.footer_shadow.hide();
            Dom.font_bar.hide();
            Dom.font_bar_shadow.hide();
        });
        //字体点击唤出面板
        Dom.font.click(function(){
            if(Dom.font_bar.css('display')=='none') {
                Dom.font_bar.show();
                Dom.font_bar_shadow.show();
                Dom.font.children('.icon-font').attr('class','icon-font-active');
            }else{
                Dom.font_bar.hide();
                Dom.font_bar_shadow.hide();
                Dom.font.children('.icon-font-active').attr('class','icon-font');
            }
        });



        //夜间模式
        $('#day_night').click(function(){
            if($(this).children('.icon-text').html()=='夜间'){
                $(this).children('.icon-night').attr('class','icon-night-active');
                Util.StorageSetter('iconNight_Day','icon-night-active');

                $(this).children('.icon-text').html('白天');

                Util.StorageSetter('nightText','白天');//记录白天

                Dom.body.css('background-color','#0f1410');
                Util.StorageSetter('bg','#0f1410');

                Dom.m_content.css('color','#4e534f');
                Util.StorageSetter('m_content_Color','#4e534f');

                Dom.uTab.css('opacity','0.6');

                Dom.uTabChild.css('color','rgba(255, 255, 255, 0.701961)');


                $('#bgMod').children().last().children().show().parent().siblings().children().hide();

            }else{
                $(this).children('.icon-night-active').attr('class','icon-night');

                Util.StorageSetter('iconNight_Day','icon-night');

                $(this).children('.icon-text').html('夜间');


                Util.StorageSetter('nightText','夜间');//记录夜间

                Dom.body.css('background-color','#e9dfc7');
                Util.StorageSetter('bg','#e9dfc7');

                Dom.m_content.css('color','');
                Util.StorageSetter('m_content_Color','');

                Dom.uTab.css('opacity','0.9');


                Dom.uTabChild.css('color','');

                $('#bgMod').children().last().children().hide();


            }

        });
        $('#large-btn').click(function(){
            if (InitFontSize > 19) {
                return;
            }else{
                InitFontSize += 1;
                Util.StorageSetter('font_size', InitFontSize);
                Dom.m_content.css('font-size', InitFontSize);
            }
        });

        $('#small-btn').click(function(){
            if (InitFontSize < 13) {
                return;
            }else{
                InitFontSize -= 1;
                Util.StorageSetter('font_size', InitFontSize);
                Dom.m_content.css('font-size', InitFontSize);
            }
        });
        $('#prev').click(function(){
            readerModel.prevChapter(function(data){
                readerUI(data);
                $('#u_tab').show();
            });
            window.scrollTo(0,0)
        });
        $('#next').click(function(){
            // alert(123);
            readerModel.nextChapter(function(data){
                readerUI(data);
                $('#u_tab').show();
            });
            window.scrollTo(0,0)
        });
    }
    main();
})();