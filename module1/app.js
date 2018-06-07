var apiUrl = 'https://api.github.com/repos/vuejs/vue/commits?per_page=3&sha=';

var demo = new Vue({
    el: '#demo',
    data: {
        branches: ['master', 'dev'],
        currentBranch: 'master',
        commits: null
    },
    created: function() {
        // 生命周期方法，使得可以在初始化的时候就直接有结果产生
        this.fetchData()
    },
    watch: {
        // 监听某个数据发生改变的时候，执行的方法，前面是监听的数据，后面是执行的方法
        currentBranch: 'fetchData'
    },
    filters: {
        truncate: function(v) {
            var newline = v.indexOf('\n');
            return newline > 0 ? v.slice(0, newline) : v;
        },
        formatDate: function(v) {
            return v.replace(/T|Z/g, '');
        }
    },
    methods: {
        fetchData: function() {
            var xhr = new XMLHttpRequest();
            var self = this;
            xhr.open('GET', apiUrl + self.currentBranch);
            xhr.onload = function() {
                self.commits = JSON.parse(xhr.responseText);
            }
            xhr.send();
        }
    } 
})
