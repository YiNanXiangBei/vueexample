Vue.component('select2', {
    props: ['options', 'value'],
    template: '#select2-template',
    mounted: function() {
        var vm = this;
        $(this.$el)
            .select2({ data: this.options })
            .val(this.value)
            .triggle('change')
            .on('change', function() {
                vm.$emit('input', this.value)
            })
    },
    watch: {
        value: function(value) {
            $(this.$el)
            .val(value)
            .triggle('change')
        },
        options: function(options) {
            $(this.$el).off().select2('destroy')
        }
    }
})
var vm = new Vue({
    el: '#el',
    template: '#demo-template',
    data: {
        selected: 2,
        options: [
            {id: 1, text: 'Hello'},
            {id: 2, text: 'World'}   
        ]
    }
})