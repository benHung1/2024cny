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
      news: [],
      rainList: [], // 用於儲存紅包
      redPacketArr: [],
      newsLists: [],
      newsFestivalLists: [],
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
      isShowOverlay: true,
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
      eventCode: "2024cny",
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

  methods: {
    start: function () {
      // console.log(this.luckyWheelQuota);
      if (!this.isLogin) {
        window.location.href =
          "https://event.setn.com/campaign/signin?code=2024cny";
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
      return true;
    },

    // 抽籤

    handleClickToday() {
      const lastClickDate = localStorage.getItem("lastClickDate");

      const userId = localStorage.getItem("userId");

      if (userId === null) {
        // 回到登入頁面
        window.location.href =
          "https://event.setn.com/campaign/signin?code=2024cny";
        return false;
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
          `https://event.setn.com/api/campaign/news/project/10268?limit=6`
        );

        this.newsLists = res.data;
      } catch (error) {
        console.log(error);
      }
    },

    async getFestivalNewsLists() {
      try {
        const res = await axios.get(
          `https://event.setn.com/api/campaign/news/project/10266?limit=12`
        );

        this.newsFestivalLists = res.data;
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
          code: "2024cny",
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
            item.formattedDate = month + "/" + day;

            return item;
          });

          // console.log(this.redPacketArr);

          this.redPacketTotalScore = res.data.total;

          if (this.isMobile) this.$refs.gameBox.style.overflow = "visible";
        } else {
          // 遊戲進行中
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
        window.location.href =
          "https://event.setn.com/campaign/signin?code=2024cny";
        return false;
      }

      const isEnougthQuota = await this.getRedPacketQuota();

      // console.log(isEnougthQuota);
      if (isEnougthQuota) {
        this.isShowGameBox = true;
        this.isShowStartTime = true;
        this.isStartedRedPacket = true;
        this.isRaining = true;
        this.isShowOverlay = false;

        this.$refs.recordBtn.style.cursor = "not-allowed";
        this.$refs.recordBtn.style.backgroundColor = "gray";
        this.$refs.recordBtn.style.border = "gray";

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
      this.isShowOverlay = true;
      this.$refs.popUp.style.display = "flex";

      this.$refs.recordBtn.style.cursor = "pointer";

      this.$refs.recordBtn.style.backgroundColor = "#ba563f";
      this.$refs.recordBtn.style.border = "2px solid #a13d29";

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

    login() {
      if (this.isLogin) {
        // 這裡是登出
        window.location.href =
          "https://event.setn.com/campaign/signOut?code=2024cny";

        this.isLogin = false;

        localStorage.removeItem("userId");

        delete axios.defaults.headers.common["Authorization"];
      } else {

        window.location.href = 
        "https://event.setn.com/campaign/signin?code=2024cny";

        this.isLogin = true;

        localStorage.setItem("userId", `${this.userId}`);
  
        axios.defaults.headers.common["Authorization"] = `Bearer ${this.userId}`;
   
      }
    },
  },
  created() {

    this.checkScreenWidth();
    
    // this.checkFortuneStickStatus();

    window.addEventListener("resize", this.checkScreenWidth, { passive: true });

    if (localStorage.getItem("arr")) {
      this.setupMidnightTimer();
    }

  },
  mounted() {
    // 進頁面先判定使用者是否登入，如果有setn_event_code代表已經登入成功

    if (document?.cookie?.match(/setn_event=([^;]+)/)) {
      // 這裡是成功登入後

      this.userId = document?.cookie?.match(/setn_event=([^;]+)/)[1];

      localStorage.setItem("userId", `${this.userId}`);

      this.isLogin = true;

      this.checkFortuneStickStatus();

      axios.defaults.headers.common["Authorization"] = `Bearer ${this.userId}`;
    }

    const currentPath = window.location.pathname;

    window.addEventListener("scroll", this.handleScroll, { passive: true });

    switch (true) {
      case currentPath.includes("/redEnvelope.html"):
        this.getRedPacketQuota();
        this.resetGame();
        break;
      case currentPath.includes("/spinToWin.html"):
        this.getTurnTableLog();
        break;
      case currentPath.includes("/festival.html"):
        this.getFestivalNewsLists();
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



new Vue(app);
