let newsCarousel;

let app = {
  el: "#app",
  data() {
    return {
      dialog: "",
      score: 0,
      wheel: {
        isPlaying: false,
        round: {
          el: ".luckywheel",
          step: 0,
          min: 3,
        },
        quota: 0,
        win: 0,
      },
      user: {
        id: "",
        wins: [],
      },

      userId: null,
      milestones: [
        {
          postsNum: 10,
          isFinished: false,
        },
        {
          postsNum: 30,
          isFinished: false,
        },
        {
          postsNum: 70,
          isFinished: false,
        },
        {
          postsNum: 100,
          isFinished: false,
        },
      ],
      topic: {
        index: 0,
        titles: [
          "台灣之光",
          "生活小10",
          "10在健康",
          "奇聞軼事",
          "社會10事",
          "政治要聞",
          "暖心時光",
          "追星10光",
          "國際10勢",
          "賺錢10紀",
        ],
      },
      news: [],
      rainList: [], // 用於儲存紅包
      redPacketArr: [],
      newsLists: [],
      newsLimts: 6,
      clickNum: 0,
      stopTime: 30,
      repeTime: 30,
      startTime: 3,
      rainScore: 2,
      timeMinus: 0,
      palyTime: 0,
      redPacketTotalScore: 0,
      redPacketQuota: 0,
      luckyWheelQuota: 0,
      index: null,
      showOverlay: true,
      isLogin: false,
      isMobile: false,
      isShowGameBox: true,
      isShowRainList: true,
      isShowStartTime: false,
      isGameOver: false,
      isStartedRedPacket: false,
      isRaining: false,
      showFortuneStickResult: false,
      isClickedBuckets: false,
      isFortuneSticksStart: true, // 詩籤區塊
      isFortuneStick: true, // 是否可以抽籤
      isFortuneSticksImgMovie: false, //籤桶動畫
      isFortuneSticksAgainBtn: false, // 再抽一次按鈕
      prizeName: "",
      isAtTop: true,
      eventCode: "2024CNY",
      redPacketApiUrl: "https://event.setn.com/api/campaign/redPacket",
      spinToWinApiUrl: "https://event.setn.com/api/campaign/SpinToWin",
      newsApiUrl: "https://event.setn.com/api/campaign/news/project/10268",
      fortuneSticksImg: "./imgs/doorfortunestickbucket.png",
      fortuneSticksImgItem: "",
      fortuneSticksList: [
        {
          src: "./imgs/Property1=1.png",
          name: "./imgs/Property1=1",
        },
        {
          src: "./imgs/Property1=2.png",
          name: "./imgs/Property1=2",
        },
        {
          src: "./imgs/Property1=3.png",
          name: "./imgs/Property1=3",
        },
        {
          src: "./imgs/Property1=4.png",
          name: "./imgs/Property1=4",
        },
        {
          src: "./imgs/Property1=5.png",
          name: "./imgs/Property1=5",
        },
        {
          src: "./imgs/Property1=6.png",
          name: "./imgs/Property1=6",
        },
        {
          src: "./imgs/Property1=7.png",
          name: "./imgs/Property1=7",
        },
        {
          src: "./imgs/Property1=8.png",
          name: "./imgs/Property1=8",
        },
      ],
    };
  },
  computed: {
    progressBar() {
      let percentage = this.score > 100 ? 100 : this.score;
      return {
        width: percentage + "%",
      };
    },
  },
  methods: {
    toggleDialog: function (name) {
      this.dialog = this.dialog == name ? "" : name;
    },

    login() {
      // 1. 成功存入cookie後取出 V

      // 2. 塞到localStorage裡面 V

      // 3. 點擊籤筒的時候 先 取儲存的userId & handleClickToday 看他今天點擊沒

      // 4. 若已經點過，直接顯示他抽到的籤，反之則顯示籤筒

      // 抽籤筒、玩遊戲的時候會用到

      document.cookie = "userId=ab584947-2318-4594-ab93-22e57e2f89f9";

      this.userId = document.cookie.match(/userId=([^;]+)/)[1];

      localStorage.setItem("userId", this.userId);

      this.isLogin = !this.isLogin;

      this.checkFortuneStickStatus();

      if (!this.isLogin) localStorage.removeItem("userId");

      console.log(this.userId, this.isLogin);
    },

    // login2() {
    //   document.cookie = "userId=ab584947-2318-4594-ab93-22e57e2f89f9";

    //   this.userId = document.cookie.match(/userId=([^;]+)/)[1];

    //   localStorage.setItem("userId", this.userId);

    //   console.log(this.userId);
    // },

    // login3() {
    //   document.cookie = "userId=ab584947-2318-4594-ab93-22e57e2f89f3";

    //   this.userId = document.cookie.match(/userId=([^;]+)/)[1];

    //   localStorage.setItem("userId", this.userId);

    //   console.log(this.userId);
    // },

    signIn: function () {
      if (this.user.id == "") {
        return false;
      }

      $.ajax({
        type: "POST",
        url: "https://event.setn.com/api/campaign/SpinToWin/2023setntime/signin",
        dataType: "json",
        crossDomain: true,
        context: { vm: this },
        data: { id: this.user.id },
      })
        .done(function (response) {
          setCookie("2023setntime", response.id, 30, ".setn.com");
          this.vm.user.id = response.id;
          this.vm.getWins();
          this.vm.getNews();
        })
        .fail(function (xhr, status) {
          this.vm.user.id = "";
          alert("沒有這個活動編號唷!");
        });

      this.toggleDialog("");
      return false;
    },
    getWins: function () {
      $.ajax({
        type: "GET",
        url: "https://event.setn.com/api/campaign/SpinToWin/2023setntime/wins",
        dataType: "json",
        crossDomain: true,
        headers: {
          Authorization: "Bearer " + this.user.id,
        },
        context: { vm: this },
        data: {},
      }).done(function (response) {
        this.vm.user.wins = response.wins;
        this.vm.wheel.quota = response.quota;
      });
    },
    scoreUp: function (score) {
      if (score >= 0) {
        this.score = score;
      } else {
        this.score++;
      }

      this.milestones.forEach(function (e) {
        if (this.score >= e.postsNum) {
          e.isFinished = true;
        }
      }, this);
    },
    start: function () {
      // console.log(this.luckyWheelQuota);
      if (!this.isLogin) {
        alert("去登入啦");
        return false;
      }

      if (this.wheel.isPlaying) {
        return false;
      }

      if (this.luckyWheelQuota == 0) {
        this.$refs.textWrapper.scrollIntoView({ behavior: "smooth" });

        this.$refs.popUp.style.display = "flex";
        this.$refs.popUpWrapper.style.display = "flex";

        this.$refs.popUpNotWinWrapper.style.display = "none";
        this.$refs.popUpWrapperWinner.style.display = "none";
        this.$refs.popUpWrapperRecord.style.display = "none";

        return false;
      }

      this.wheel.isPlaying = true;
      this.wheel.win = 0;
      this.spin();
    },
    spin: async function () {
      let round = this.wheel.round;
      round.step++;

      try {
        const res = await axios.post(
          `${this.spinToWinApiUrl}/spin?code=${this.eventCode}`
        );

        // console.log(res);

        if (res.data.quota) this.luckyWheelQuota = res.data.quota;

        this.$refs.lcukyWheel.style.transform =
          "rotate(" +
          (round.step * round.min * 360 + 180 - res.data.id * 60) +
          "deg)";

        this.luckyWheelQuota--;

        // 這裡應該是等動畫結束後執行某些事情

        setTimeout(() => {
          this.$refs.popUp.style.display = "flex";
          this.$refs.textWrapper.scrollIntoView({ behavior: "smooth" });

          if (res.data.id === 0) {
            // 代表沒中獎
            this.$refs.popUpNotWinWrapper.style.display = "flex";
          } else {
            // 中獎 需要知道中獎名稱
            this.$refs.popUpWrapperWinner.style.display = "flex";

            const prize = [
              "再接再厲",
              "全家 虛擬禮物卡 $100",
              "好禮即享券 頂規好禮組 $200",
              "7-11虛擬商品卡 $50",
              "好禮即享券 量販美妝組 $300",
              "爭鮮集團 好禮即享券 $100",
            ];

            for (let i = 0; i < prize.length; i++) {
              // console.log(prize[res.data.id]);
              this.prizeName = prize[res.data.id];
              break;
            }
          }
          this.$refs.popUpWrapperRecord.style.display = "none";
          this.$refs.textWrapper.scrollIntoView({ behavior: "smooth" });
        }, 3000);
      } catch (error) {
        // console.log(error);
      }

      // $.ajax({
      //   type: "POST",
      //   url: "https://event.setn.com/api/campaign/SpinToWin/2023setntime/spin",
      //   dataType: "json",
      //   crossDomain: true,
      //   headers: {
      //     Authorization: "Bearer " + this.user.id,
      //   },
      //   context: { vm: this },
      //   data: {},
      // }).done(function (response) {
      //   this.vm.wheel.win = response.id;
      //   this.vm.wheel.quota--;
      //   document.querySelector(round.el).style.transform =
      //     "rotate(" +
      //     (round.step * round.min * 360 + 100 - response.id * 72) +
      //     "deg)";
      // });
    },

    async getTurnTableLog() {
      try {
        const res = await axios.get(
          `${this.spinToWinApiUrl}/wins?code=${this.eventCode}`
        );

        this.user.wins = res.data.wins;

        this.luckyWheelQuota = res.data.quota;

        // console.log(res, this.user.wins);
      } catch (error) {
        console.log(error);
      }
    },

    settle: function () {
      this.wheel.isPlaying = false;
      this.getWins();
      return true;
    },
    getNews() {
      $.ajax({
        type: "GET",
        url: "assets/data/news/" + this.topic.index + ".json",
        dataType: "json",
        crossDomain: true,
        headers: {
          Authorization: "Bearer " + this.user.id,
        },
        context: { vm: this },
        data: {},
      }).done(function (response) {
        this.vm.news = response;
        // this.vm.scoreUp(response.score);
        if (newsCarousel) {
          newsCarousel.trigger("to.owl.carousel", 0);
        }
      });
    },
    activateTopic(index) {
      let info = sliders.base.getInfo();
      info.slideItems[info.index + 1].classList.add("img-click");

      this.topic.index = index;
      sliders.base.goTo(index);
      this.getNews();
    },

    // 抽籤

    handleClickToday() {
      const lastClickDate = localStorage.getItem("lastClickDate");

      const userId = localStorage.getItem("userId");

      if (userId === null) {
        // 回到登入頁面
        alert("去登入拉");
        return;
      } else {
        // localStorage有userId，代表已經登入

        // 但是我可能會在一台裝置上登入兩個帳號

        // 這時候就需要判斷第一個帳號抽到的是數字幾，第二個帳號抽到的是數字幾，以此類推，所以是不是要包成一個物件去儲存? 然後根據到時候登入的是哪個帳號決定顯示什麼內容

        if (!lastClickDate || !this.isToday(new Date(lastClickDate))) {
          this.fortuneSticksStart();
        }
      }
    },

    isToday(date) {
      const today = new Date().toISOString().split("T")[0];
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    },

    fortuneSticksStart() {
      let _this = this;

      const userId = localStorage.getItem("userId");

      const arr = [];

      if (this.isFortuneStick == true) {
        this.isFortuneStick = false; // 鎖住抽籤
        this.isFortuneSticksImgMovie = true; // 開啟抽籤動畫
        setTimeout(function () {
          let fortuneSticksNum = _this.getRandom(1, 8);
          _this.isFortuneSticksImgMovie = false; // 關閉抽籤動畫
          _this.isFortuneSticksStart = false; // 關閉抽籤筒
          _this.fortuneSticksImgItem = fortuneSticksNum; // 打開亂數抽籤紙
          _this.isFortuneSticksAgainBtn = true; // 打開再次抽籤按鈕
          this.isClickedFortuneStick = true;

          // 將抽中的詩籤存到 localStorage 中

          // localStorage.setItem("lastClickDate", new Date().toISOString());
          // localStorage.setItem("fortuneSticksImgItem", fortuneSticksNum);

          if (localStorage.getItem("arr")) {
            // 代表使用者已經有抽籤紀錄，是使用第二個帳號

            // 取出 localStorage 中的 arr
            const arr = JSON.parse(localStorage.getItem("arr"));

            const newUserData = {
              userId: userId,
              lastClickDate: new Date().toISOString().split("T")[0],
              fortuneSticksImgItem: _this.fortuneSticksImgItem,
            };

            // 將新的內容塞入 arr
            arr.push(newUserData);

            // 更新 localStorage 中的 arr
            localStorage.setItem("arr", JSON.stringify(arr));
          } else {
            // 代表還沒有抽籤過
            const userData = {
              userId: userId,
              lastClickDate: new Date().toISOString().split("T")[0],
              fortuneSticksImgItem: fortuneSticksNum,
            };

            // 初始化一個空的 arr 並將第一筆資料放入
            const arr = [userData];

            // 將 arr 存入 localStorage
            localStorage.setItem("arr", JSON.stringify(arr));
          }

          // 這裡接著打新聞api & 顯示新聞

          _this.getNewsLists();

          _this.isClickedBuckets = true;
        }, 3000);
      }
    },

    async getNewsLists() {
      try {
        const res = await axios.get(
          `https://event.setn.com/api/campaign/news/project/10268?limit=${this.newsLimts}`
        );

        this.newsLists = res.data;
      } catch (error) {
        console.log(error);
      }
    },

    checkFortuneStickStatus() {
      const arr = JSON.parse(localStorage.getItem("arr"));

      const userId = localStorage.getItem("userId");

      const hasUserId = arr?.find((item) => item.userId === userId);

      const today = new Date().toISOString().split("T")[0];

      // console.log(
      //   hasUserId?.lastClickDate && today === hasUserId?.lastClickDate
      // );

      if (hasUserId?.lastClickDate && today === hasUserId?.lastClickDate) {
        // 代表今天已經抽獎過，顯示中籤頁面
        this.showFortuneStickResult = true;
        this.fortuneSticksImgItem =
          hasUserId.fortuneSticksImgItem || this.getRandom(1, 8);
        this.isClickedBuckets = true;
        this.getNewsLists();
      } else {
        this.showFortuneStickResult = false;
      }
    },

    setupMidnightTimer() {
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);

      // 計算距離午夜的時間(毫秒)
      const timeUntilMidnight = midnight - new Date();

      // 設置定時器，在午夜時執行清除 localStorage 的函數
      setTimeout(() => {
        localStorage.removeItem("arr");
        this.showFortuneStickResult = false;
        this.isFortuneSticksStart = true;
        this.isClickedBuckets = false;
        // console.log("十二點到了");
        localStorage.setItem("clear", "clearrr");
        // 確保每天 0:00 執行
        this.setupMidnightTimer();
      }, timeUntilMidnight);
    },

    toTop() {
      window.scroll({
        top: 0,
        behavior: "smooth",
      });
    },

    // 紅包

    async postFinalNum() {
      const api = `${this.redPacketApiUrl}/score`;

      try {
        const res = await axios.post(api, {
          code: "2024CNY",
          num: this.clickNum,
        });

        // console.log(res);
      } catch (error) {
        console.log(error);
      }
    },

    async getRedPacketQuota() {
      const api = `${this.redPacketApiUrl}/quota?code=${this.eventCode}`;

      try {
        const res = await axios.get(api);

        this.redPacketQuota = res.data.quota;

        return res.data.quota >= 1;
      } catch (error) {
        console.log(error);
      }
    },

    async getPlayLog() {
      const api = `${this.redPacketApiUrl}/score/daily?code=${this.eventCode}`;

      try {
        if (!this.isRaining) {

          const res = await axios.get(api);

          this.$refs.popUp.style.display = "flex";

          this.$refs.textWrapper.scrollIntoView({ behavior: "smooth" });

          this.$refs.popUpWrapperRecord.style.display = "flex";

          // this.$refs.popUpWrapperWinner.style.display = "flex";

          this.$refs.popUpWrapperWinner.style.display = "none";

          this.$refs.popUpWrapper.style.display = "none";

          this.redPacketArr = res.data.daily;

          // console.log(this.redPacketArr, res);

          this.redPacketArr = res.data.daily.map((item) => {
            // 將字串轉換為日期物件
            var dateObject = new Date(item.date);

            // 取得月份和日期，並補零
            var month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
            var day = dateObject.getDate().toString().padStart(2, "0");

            // 格式化日期
            item.formattedDate = month + "-" + day;

            return item;
          });

          // console.log(this.redPacketArr);

          this.redPacketTotalScore = res.data.total;

          if (this.isMobile) this.$refs.gameBox.style.overflow = "visible";
        }
      } catch (error) {
        console.log(error);
      }
    },

    getRandom(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    rainClick(index) {
      if (!this.rainList[index].clicked) {
        this.rainList[index].clicked = true;
        event.target.classList.add("fade-out");
        this.clickNum += this.rainScore;
        // console.log(index);

        const secondToLastIndex = this.rainList.length - 2;
        const lastIndex = this.rainList.length - 1;

        if (
          (index > 28 &&
            this.rainList[secondToLastIndex].clicked &&
            this.rainList[lastIndex].clicked) ||
          this.clickNum >= 50
        ) {
          // console.log("倒數兩個都被點擊後，結束遊戲");
          this.gameEnded();
        }
      }
    },

    async startGame() {
      if (this.isLogin === false) {
        alert("去登入啦");
        return false;
      }

      const isEnougthQuota = await this.getRedPacketQuota();

      // console.log(isEnougthQuota);
      if (!isEnougthQuota) {
        this.isShowGameBox = true;
        this.isShowStartTime = true;
        this.isStartedRedPacket = true;
        this.isRaining = true;
        this.showOverlay = false;

        this.$refs.gameBox.style.overflow = "hidden";

        this.timeMinus = setInterval(() => {
          this.startTime -= 1;

          if (this.startTime < 1) {
            this.isShowStartTime = false;
            clearInterval(this.timeMinus);
            this.game01();
          }
        }, 1000);
      } else {
        this.$refs.popUp.style.display = "flex";
        this.$refs.textWrapper.scrollIntoView({ behavior: "smooth" });
        if (this.isMobile) this.$refs.gameBox.style.overflow = "visible";
        this.$refs.popUpWrapper.style.display = "flex";
        this.$refs.popUpWrapperRecord.style.display = "none";
        this.$refs.popUpWrapperWinner.style.display = "none";
      }
    },
    game01() {
      let count = 0;
      this.palyTime = setInterval(() => {
        this.stopTime -= 1;

        if (this.stopTime <= 0) {
          clearInterval(this.palyTime);
        }
      }, 1000);

      const palyGame1 = setInterval(() => {
        count += 1;
        this.index = count;

        let ranNum1 = this.getRandom(1, 8);
        let runTime = this.getRandom(2, 7);

        let styleClass = "style" + count;

        this.rainList.push({
          id: count,
          class: ranNum1,
          duration: runTime / 2,
          styleClass: styleClass,
        });

        if (count >= this.repeTime) {
          clearInterval(palyGame1);
        }
      }, 1000);
    },

    gameEnded() {
      this.isGameOver = true;
      this.isShowRainList = false;
      this.isRaining = false;
      this.showOverlay = true;
      this.$refs.popUp.style.display = "flex";
      this.$refs.textWrapper.scrollIntoView({ behavior: "smooth" });

      clearInterval(this.palyTime);
      this.$refs.popUpWrapperWinner.style.display = "flex";

      this.$refs.popUpWrapperRecord.style.display = "none";
      if (this.isMobile) this.$refs.gameBox.style.overflow = "visible";

      this.postFinalNum();
    },

    animationEndHandler(index) {
      // console.log(index);
      if (index >= 29 && index == this.rainList.length - 1) {
        this.gameEnded();
        return true;
      }
      return false;
    },

    playAgain() {
      this.$refs.popUp.style.display = "none";
      this.resetGame();
      this.startGame();
    },

    resetGame() {
      this.clickNum = 0;
      this.stopTime = 30;
      this.repeTime = 30;
      this.startTime = 3;
      this.rainList = [];
      this.isShowRainList = true;
      this.isGameOver = false;
      this.isShowStartTime = false;
    },

    handleScroll() {
      this.isAtTop = window.scrollY === 0;
    },

    checkScreenWidth() {
      this.isMobile = window.innerWidth < 768;
    },

    // popup

    handlePopUpClose() {
      this.$refs.popUp.style.display = "none";
      this.isStartedRedPacket = false;
      this.resetGame();
    },

    handleWheelRecord() {
      this.getTurnTableLog();
      this.$refs.popUp.style.display = "flex";
      this.$refs.popUpWrapperRecord.style.display = "flex";

      this.$refs.popUpWrapper.style.display = "none";
      this.$refs.popUpNotWinWrapper.style.display = "none";
      this.$refs.popUpWrapperWinner.style.display = "none";

      this.$refs.textWrapper.scrollIntoView({ behavior: "smooth" });
    },
  },
  created() {
    this.user.id = getCookie("2023setntime");

    this.checkScreenWidth();

    window.addEventListener("resize", this.checkScreenWidth, { passive: true });

    if (this.user.id) {
      this.getWins();
    }

    if (localStorage.getItem("arr")) {
      this.setupMidnightTimer();
    }

    this.checkFortuneStickStatus();
  },
  mounted() {
    if (localStorage.getItem("userId")) this.isLogin = true;

    const currentPath = window.location.pathname;

    window.addEventListener("scroll", this.handleScroll, { passive: true });

    // 進頁面先判定使用者是否登入，如果有setn_event_code代表已經登入成功
    // if(document?.cookie?.match(/setn_event_code=([^;]+)/)) {
    //   this.user.id =  document?.cookie?.match(/setn_event_code=([^;]+)/)
    // }

    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ab584947-2318-4594-ab93-22e57e2f89f0`;

    switch (true) {
      case currentPath.includes("/redEnvelope.html"):
        this.getRedPacketQuota();
        this.resetGame();
        break;
      case currentPath.includes("/spinToWin.html"):
        this.getTurnTableLog();
        break;
      case currentPath.includes("/festival.html"):
        this.newsLimts = 12;
        this.getNewsLists();
        break;
      default:
        break;
    }
  },
  updated() {},

  beforeDestroy() {
    window.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("resize", this.checkScreenWidth);
  },
};

Vue.component("news-box", {
  props: {
    news: Array,
  },
  template: `<div class="Abox" id="newsBox">
        <ul class="Abox-content owl-carousel">
            <a href="#" class="newsbox item" target="_blank" v-for="(item, i) in news" @click.prevent="openSETNews(i)">
                <li :class="{read: item.isRead}">
                    <img :src="item.image" alt="">
                    <p class="news-title">{{item.shortSlug}}</p>
                    <div class="news-content">{{item.summary}}</div>
                </li>
            </a>
        </ul>
    </div>`,
  data() {
    return {};
  },
  methods: {
    initCarousel: function () {
      newsCarousel = $(".owl-carousel").owlCarousel({
        loop: true,
        margin: 10,
        responsiveClass: true,
        loop: true,
        nav: true,
        autoplay: true,
        autoplayTimeout: 5000,
        responsive: {
          0: {
            items: 1,
            autoplayTimeout: 7000,
            dots: false,
          },
          600: {
            items: 2,
            autoplayTimeout: 6000,
            dots: false,
          },
          1000: {
            items: 3,
            nav: false,
          },
        },
      });
    },
    openSETNews: function (i) {
      let newsId = this.news[i].newsID;
      window.open("https://www.setn.com/News.aspx?NewsID=" + newsId);
      return true;

      $.ajax({
        type: "POST",
        url: "https://event.setn.com/api/campaign/SpinToWin/2023setntime/openSETNews",
        dataType: "json",
        crossDomain: true,
        headers: {
          Authorization: "Bearer " + getCookie("2023setntime"),
        },
        context: { vm: this },
        data: { newsId: newsId },
      }).done(function (response) {
        if (this.vm.news[i].isRead == true) {
          return false;
        }

        this.vm.$emit("score-up");
        this.vm.news[i].isRead = true;
      });
    },
  },
  created() {
    this.$emit("get-news");
  },
  mounted() {},
  updated() {
    this.initCarousel();
    this.$nextTick(function () {});
  },
});

function setCookie(c_name, value, expiredays, domain) {
  var _exdate = new Date();
  _exdate.setDate(_exdate.getDate() + expiredays);
  document.cookie =
    c_name +
    "=" +
    escape(value) +
    ";domain=" +
    domain +
    ";path=/" +
    (expiredays == null ? "" : ";expires=" + _exdate.toGMTString());
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

new Vue(app);
