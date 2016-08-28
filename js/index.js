/**
 * Created by fzy on 2016-08-28.
 */
(function(){
    /*���߷���localStorage*/
    var Util=(function(){
        var prefix='html5_reader_';
        var StorageGetter=function(key){
            return localStorage.getItem(prefix+key);
        };
        var StorageSetter=function(key,val){
            return localStorage.setItem(prefix+key,val);
        };
        //��ȡjson
        var getBSON=function(url,callback){
            return $.jsonp({
                url:url,
                cache:true,//����
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
    //��һ�»�����չʾ���
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

    //��ʼ���������С
    var InitFontSize;
    //����������Ϣ
    InitFontSize = Util.StorageGetter('font_size');
    InitFontSize = parseInt(InitFontSize);
    if (!InitFontSize) {
        InitFontSize = 14;
    }
    Dom.m_content.css('font-size', InitFontSize);
    Util.StorageSetter('font_size',InitFontSize);

    /*����Ĭ�ϱ�����ɫ*/
    var bg ;//Ĭ��body ������ɫ
    var m_content_Color;//Ĭ������������ɫ
    var index;

    var nightText; //ҹ��Ͱ���ļ�¼
    var iconNight_Day;

    index=Util.StorageGetter('index');
    if(!index){
        index=0;
    }
    $('#bgMod').children('.bk-container').eq(index).children().show();
    Util.StorageSetter('index',index);



    nightText=Util.StorageGetter('nightText');
    if(!nightText){
        nightText='ҹ��';
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
//��Ŀ��ں���
    function main(){
        readerModel=ReaderModel();//����ģ��
        readerUI=ReaderBaseFrame(Dom.m_content);
        readerModel.init(function(data){  //��ʼ������
            readerUI(data);
            $('#u_tab').show();
        });


        EventHandler();
    }
//��ȡ����
    function ReaderModel(){
        //ʵ�ֺ��Ķ�����ص����ݽ����ķ���
        var Chapter_id;
        var ChapterTotal;
        //��ʼ������
        var init=function(Uicallback){
            getFictionInfo(function(){
                getCurChapterContent(Chapter_id,function(data){
                    //���صõ���json���� �ص���������json ����
                    Uicallback && Uicallback(data);
                });
            });
        };
        //����½ڵ�Chapter_id �� ChapterTotal
        var getFictionInfo=function(callback){
            $.get('data/chapter.json',function(data){
                Chapter_id=Util.StorageGetter("Chapter_id")||1;//����Chapter_id �ӱ��ش洢��,����������Ϊ1
                ChapterTotal=data.chapters.length;

                console.log(ChapterTotal);
                callback && callback();

            },'json');
        };

        //����½ڵ�URl��json
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
        //��һҳ
        var prevChapter=function(Uicallback){
            Chapter_id=parseInt(Chapter_id,10);
            if(Chapter_id==0){
                return;
            }
            Chapter_id-=1;
            getCurChapterContent(Chapter_id,Uicallback);
            Util.StorageSetter("Chapter_id",Chapter_id);//���浱ǰ��Chapter_id �½�
        };
        //��һҳ
        var nextChapter=function(Uicallback){
            Chapter_id=parseInt(Chapter_id,10);
            if(Chapter_id==ChapterTotal){
                return;
            }
            Chapter_id += 1;
            getCurChapterContent(Chapter_id,Uicallback);
            Util.StorageSetter("Chapter_id",Chapter_id);//���浱ǰ��Chapter_id �½�
        };


        return {
            init:init,
            prevChapter:prevChapter,
            nextChapter:nextChapter,
        }

    }

//��Ⱦui�ṹ
    function ReaderBaseFrame(container){
        function parseChapterData(jsonData){
            var jsonObj=JSON.parse(jsonData);/* json (JSON) �ַ���ת��Ϊ����*/
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
//�����¼���
    function EventHandler(){
        //����ͱ�������ɫ��
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
        //�������������
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



        //ҹ��ģʽ
        $('#day_night').click(function(){
            if($(this).children('.icon-text').html()=='ҹ��'){
                $(this).children('.icon-night').attr('class','icon-night-active');
                Util.StorageSetter('iconNight_Day','icon-night-active');

                $(this).children('.icon-text').html('����');

                Util.StorageSetter('nightText','����');//��¼����

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

                $(this).children('.icon-text').html('ҹ��');


                Util.StorageSetter('nightText','ҹ��');//��¼ҹ��

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