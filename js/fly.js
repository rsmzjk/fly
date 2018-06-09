/**
 *
 * @authors Your Name (you@example.org)
 * @date    2018-03-14 21:07:51
 * @version $Id$
 */
~function () {
    //兼容
    window.requestAnimationFrame = window.requestAnimationFrame || function (fn) {return setTimeout(fn,1000/60)};
    window.cancelAnimationFrame = window.cancelAnimationFrame || clearTimeout;
    //获取变量
    var oPlane = document.getElementById('plane'),
        oLevel = oPlane.getElementsByClassName('level')[0],
        aP = oLevel.getElementsByTagName('p'),
        oMap = oPlane.getElementsByClassName('map')[0],
        oEnbiuAll = oPlane.getElementsByClassName('enbiu')[0],
        oBiuAll = oPlane.getElementsByClassName('biu')[0],
        oScore = oPlane.getElementsByClassName('score')[0],
        oRestart = oPlane.getElementsByClassName('restart')[0],
        allEnbiu = oEnbiuAll.children,
        allBiu = oBiuAll.children,
        allRestart = oRestart.children,
        oPlaneL = oPlane.offsetLeft,
        oPlaneT = oPlane.offsetTop,
        w = oMap.clientWidth,
        h = oMap.clientHeight,
        length = aP.length;
    //初始选择难度界面的点击事件
    (function plane() {
        for (var i = 0; i < length; i++) {
            ~function (index) {
                aP[index].onclick = function (ev) {
                    ev = ev || window.event;
                    start(index,{
                        x: ev.clientX - oPlaneL,
                        y: ev.clientY - oPlaneT
                    })
                }
            }(i);
        };
        allRestart[2].onclick = function(ev){
            var ev = ev || window.event;
            cancelAnimationFrame(oMap.timer);//停止背景滚动
            oRestart.style.display = 'none';//隐藏关卡选项
            oLevel.style.display = 'block';//隐藏关卡选项
            oScore.innerHTML = '当前分数: '+0;
            oMap.innerHTML = '';
            oMap.innerHTML = "<div class='enbiu'></div>" +
                "<div class='biu'></div>";
            oEnbiuAll = oPlane.getElementsByClassName('enbiu')[0];
            oBiuAll = oPlane.getElementsByClassName('biu')[0];
            allEnbiu = oEnbiuAll.children;
            allBiu = oBiuAll.children;
        }
    })();
    //开始游戏
    function start(level,pos) {
        clearMap(); //执行 隐藏和清理地图
        mapBg(level); //执行 关卡背景选择
        var aArmy = army(level,pos); //执行 创建我军
        enemy(aArmy,level); //执行 创建敌军
        oPlane.score = 0; //执行 等分清零
    };
    //清理地图
    function clearMap() {
        oScore.style.display = 'block'; //执行 显示分数
        oLevel.style.display = 'none'; //执行 隐藏关卡选项
    };
    //关卡背景
    function mapBg(level) {
        oMap.style.backgroundImage = 'url(image/bg_'+(level+1)+'.jpg)';
        ~function run() {
            oMap.bgPosY = oMap.bgPosY || 0;
            oMap.bgPosY++;
            oMap.style.backgroundPositionY = oMap.bgPosY + 'px';
            oMap.timer = requestAnimationFrame(run);
        }();
    };
    //创建我军
    function army(level,pos) {
        //创建我军图片
        var oImg = new Image();
        oImg.src = 'image/plane_'+level+'.png';
        oImg.className = 'army';
        oImg.width = [97.6,97,97,97][level];
        oImg.height = [76,97,97,97][level];
        oImg.style.left = pos.x - oImg.width/2 + 'px';
        oImg.style.top = pos.y - oImg.height/2 + 'px';
        oMap.appendChild(oImg);

        //我军移动边界
        var minLeft = -oImg.width/2,
            maxLeft = w + minLeft,
            minTop = 0,
            maxTop = h - oImg.height/2;
        
        //我军移动
        document.onmousemove = function (ev) {
            ev = ev || window.event;
            var left = ev.clientX - oPlaneL - oImg.width/2,
                top = ev.clientY - oPlaneT - oImg.height/2;
            left = Math.max(left,minLeft);
            left = Math.min(left,maxLeft);
            top = Math.max(top,minTop);
            top = Math.min(top,maxTop);

            oImg.style.top = top + 'px';
            oImg.style.left = left + 'px';
        };
        //调用子弹函数
        fire(oImg,level);
        return oImg; //返回我军
    };
    //我军子弹
    function fire(oImg,level) {
        var time = [150,100,60,20][level];
        oPlane.biu = setInterval(function () {
            if (oPlane.score >= 1000) {
                createBiu(true,-1);
                createBiu(true,0);
                createBiu(true,1);
            }else if (oPlane.score >= 500) {
                createBiu(true,-1);
                createBiu(true,1);
            }else{
                createBiu();
            }
        },time);
        function createBiu(bool,count) {
            //创建我军子弹
            var oBiu = new Image();
            oBiu.src = 'image/fire_1.png';
            oBiu.className = 'biu';
            oBiu.width = 30;
            oBiu.height = 30;
            var left = oImg.offsetLeft + oImg.width/2-oBiu.width/2,
                top = oImg.offsetTop - oBiu.height + 5;
            if( bool ){
                left += oBiu.width*count;
            }
            oBiu.style.left = left + 'px';
            oBiu.style.top = top + 'px';
            oBiuAll.appendChild(oBiu);

            //我军子弹运动
            function run() {
                var top = oBiu.offsetTop - oBiu.height;
                oBiu.style.top = top + 'px';
                if( top < -oBiu.height ){
                    oBiuAll.removeChild(oBiu)
                }else {
                    requestAnimationFrame(run);
                }
            }
            setTimeout(function () {
                requestAnimationFrame(run);
            },50)
        };
    };
    //创建敌军
    function enemy(army,level) {
        var time = [350,150,120,50][level], //敌军生成速度
            speed = [5,6,8,10][level], //敌军下落速度
            save = Math.random(),
            num = 1;
        oPlane.enemy = setInterval(function () {
            var index = num%30?1:0,
                enImg = new Image(); //创建敌军
            enImg.index = index;
            enImg.HP = [10,1][index];
            enImg.speed = speed + (save*.6 -.3)*speed;
            enImg.speed *= index?1:.5;
            enImg.src = 'image/enemy_'+['big','small'][index]+'.png';
            enImg.className = 'enemy';
            enImg.width = [104,54][index];
            enImg.height = [80,40][index];
            enImg.style.top = -enImg.height + 'px';
            enImg.style.left = Math.random()*w - enImg.width/2 + 'px';
            oMap.appendChild(enImg);
            num++;

            //敌军运动
            function run() {
                var top = enImg.offsetTop;
                top += enImg.speed;
                if( enImg.parentNode ){
                    if( top > h ){
                        oPlane.score--;
                        oScore.innerHTML = '当前分数: '+oPlane.score;
                        oMap.removeChild(enImg);
                    }else {
                        enImg.style.top = top + 'px';
                        //我军子弹碰撞检测
                        for (var i = allBiu.length - 1; i >=0; i--) {
                            var objBiu = allBiu[i];
                            if (isColl(enImg,objBiu)) {
                                oBiuAll.removeChild(objBiu);//移除子弹
                                enImg.HP--;
                                if (!enImg.HP) {
                                    oPlane.score += enImg.index?10:20;//打掉飞机加分
                                    oScore.innerHTML = '当前分数: '+oPlane.score;
                                    boom(enImg,index?0:2);//敌军爆炸
                                    oMap.removeChild(enImg);//移除敌军
                                    return false;
                                }
                            }
                        }
                        //我军碰撞检测
                        if (army.parentNode && isColl(enImg,army)) {
                            boom(enImg,index?0:2);//执行 敌军爆炸
                            boom(army,1,level);//执行 我军爆炸
                            oMap.removeChild(enImg);//执行 移除敌军
                            oMap.removeChild(army);//执行 移除我军
                            GameOver();//游戏结束
                            return false;
                        }
                        requestAnimationFrame(run);
                    }
                }
            };
            requestAnimationFrame(run);
            //创建敌军子弹
            enfire(enImg,army,level,index);
        },time);
    };
    //敌军子弹
    function enfire(enImg,army,level,index) {
        var time = [700,600,500,400][level], //敌军子弹生成速度
            speed = [4,5,6,7][level]; //敌军子弹下落速度
        oPlane.enfire = setInterval(function () {
            //创建敌军子弹
            var enBiu = new Image();
            enBiu.speed = speed + (Math.random()*.6+.3)*speed;
            enBiu.speed *= index?1:.5;
            enBiu.src = 'image/enfire_'+['1','0'][index]+'.png';
            enBiu.className = 'enbiu';
            enBiu.width = [30,6][index];
            enBiu.height = [30,22][index];
            enBiu.style.top = enImg.offsetTop + enBiu.height + 18 + 'px';
            enBiu.style.left = enImg.offsetLeft + (enImg.width - enBiu.width)/2 + 'px';
            oEnbiuAll.appendChild(enBiu);

            //敌军子弹运动
            function run() {
                var top = enBiu.offsetTop;
                top += enBiu.speed;
                if( !enImg.parentNode || top > h ){
                    enBiu.parentNode.removeChild(enBiu);
                }else {
                    enBiu.style.top = top + 'px';
                    //敌军子弹碰撞检测
                    for (var i = allEnbiu.length - 1; i >=0; i--) {
                        var objEnBiu = allEnbiu[i];
                        if (isColl(army,objEnBiu)) {
                            boom(army,1,level);//我军爆炸
                            oMap.removeChild(army);//移除我军
                            enBiu.parentNode.removeChild(enBiu);//移除敌军子弹
                            GameOver();//游戏结束
                            return false;
                        }
                    };
                    requestAnimationFrame(run);
                }
            };
            requestAnimationFrame(run);
        },time);
    };
    //爆炸的艺术
    function boom(obj,index,level) {
        //创建爆炸图片
        var boom = new Image();
        boom.src = 'image/'+['boom_small','plane_'+level+'','boom_big'][index]+'.png';
        boom.className = 'boom'+['','2',''][index];
        boom.width = obj.width;
        boom.height = obj.height;
        boom.style.top = obj.offsetTop + 'px';
        boom.style.left = obj.offsetLeft + 'px';
        oMap.appendChild(boom);
        setTimeout(function () {
            boom.parentNode && oMap.removeChild(boom);
        },1200)
    };
    //碰撞检测
    function isColl(enImg,army) {
        //敌军
        var aT = enImg.offsetTop,
            aB = aT + enImg.clientHeight,
            aL = enImg.offsetLeft,
            aR = aL + enImg.clientWidth;
        //我军
        var eT = army.offsetTop,
            eB = eT + army.clientHeight,
            eL = army.offsetLeft,
            eR = eL + army.clientWidth;
        return !(eT>aB||eB<aT||eL>aR||eR<aL);
    };
    //游戏结束
    function GameOver(){
        document.onmousemove = null; //执行 清除我军移动事件
        clearInterval(oPlane.biu); //执行 我军不在生成新的子弹
        clearInterval(oPlane.enemy); //执行 不在生成新的敌军
        clearInterval(oPlane.enfire); //执行 敌军不在生成新的子弹
        restart(); //执行 重新开始
    };
    //结算/重新开始
    function restart(){
        oScore.style.display = 'none';//执行 隐藏关卡选项
        var sCore = oPlane.score,
            results;
        if (sCore < -300) {
            results = "闪避+MAX!!!";
        }else if (sCore < 10 ) {
            results = "弱鸡!就是你...";
        }else if (sCore < 30 ) {
            results = "抠脚侠";
        }else if (sCore < 100) {
            results = "初级飞机大师";
        }else if (sCore < 200) {
            results = "渐入佳境";
        }else if (sCore < 500) {
            results = "中级飞机大师";
        }else if (sCore < 1000) {
            results = "高级飞机大师";
        }else if (sCore < 5000) {
            results = "终极飞机大师";
        }else{
            results = "葵花宝典+独孤求败";
        }
        oRestart.style.display = 'block';//
        allRestart[0].children[0].innerHTML = sCore;
        allRestart[1].children[0].innerHTML = results;
    };
}();
