<template lang="html">
  <span :style="colorStyle" class="author-initial">{{ initial }}</span>
</template>

<script>
export default {

    data() {
        return {
            colorStyles:[
                {
                    backgroundColor:"#b1ddd0",
                    color:"#000"
                },
                {
                    backgroundColor:"#c4c1e0",
                    color:"#000"
                },
                {
                    backgroundColor:"#f7abad",
                    color:"#000"
                },
                {
                    backgroundColor:"#fdfad9",
                    color:"#000"
                },
                {
                    backgroundColor:"#90d1bc",
                    color:"#000"
                },
                {
                    backgroundColor:"#a2a1cf",
                    color:"#000"
                },
                {
                    backgroundColor:"#f38485",
                    color:"#000"
                },
                {
                    backgroundColor:"#fbf6b5",
                    color:"#000"
                },
                {
                    backgroundColor:"#6ec5a6",
                    color:"#000"
                },
                {
                    backgroundColor:"#7e81be",
                    color:"#000"
                },
                {
                    backgroundColor:"#f05d5f",
                    color:"#000"
                },
                {
                    backgroundColor:"#faf291",
                    color:"#000"
                },
                {
                    backgroundColor:"#1e7658",
                    color:"#fff"
                },
                {
                    backgroundColor:"#2a3167",
                    color:"#fff"
                },
                {
                    backgroundColor:"#ab1f23",
                    color:"#fff"
                },
                {
                    backgroundColor:"#b8af31",
                    color:"#000"
                },
                {
                    backgroundColor:"#538970",
                    color:"#000"
                },
                {
                    backgroundColor:"#4b4b79",
                    color:"#fff"
                },
                {
                    backgroundColor:"#b94e3b",
                    color:"#fff"
                },
                {
                    backgroundColor:"#acac56",
                    color:"#000"
                },
                {
                    backgroundColor:"#799f8b",
                    color:"#000"
                },
                {
                    backgroundColor:"#6f6b90",
                    color:"#fff"
                },
                {
                    backgroundColor:"#c6745e",
                    color:"#000"
                },
                {
                    backgroundColor:"#d2cfa2",
                    color:"#000"
                }
            ],
        }
    },

    props: {
        authorName: {
            type: String,
            required: true
        }
    },

    methods: {
      stringToColorStyle(str) {
        var sum = 0;
        for (var i = 0; i < str.length; i++) {
          sum += str.charCodeAt(i);
        }
        return this.colorStyles[sum%24];
      }
    },

    computed: {
        initial() {
            let nameArray = this.authorName.split(' ')
            return `${nameArray[0].slice(0,1)}${nameArray[nameArray.length-1].slice(0,1)}`
        },
        colorStyle() {
            return this.stringToColorStyle(this.authorName)
        }
    }
}
</script>

<style scoped lang="scss">
    .author-initial {
      font-size: 18px;
      height: 40px;
      line-height: 40px;
      background: #20d093;
      width: 40px;
      color: #fff;
      cursor: default;
      display: inline-block;
      text-align: center;
      text-transform: uppercase;
      vertical-align: middle;
      margin: 5px 10px 5px 0;
      border-radius: 50%;
    }
</style>
