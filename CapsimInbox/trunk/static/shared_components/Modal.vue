<template lang="html">
    <div class="modal fade" tabindex="-1" role="dialog">
        <div :class="`modal-${size}`" class="modal-dialog" role="document">
            <div class="modal-content mat">
                <div class="modal-header">
                    <button v-if="showExit" @click="$emit('closed')" type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <slot class="modal-title" name="title"></slot>
                </div>
                <div class="modal-body">
                    <slot name="body"></slot>
                </div>
                <div v-if="showFooter" class="modal-footer">
                    <button v-if="showOkay" @click="$emit('confirm')" type="button" class="btn" :class="`${confirmClass}`">{{ confirmText }}</button>
                    <button v-if="showClose" @click="$emit('closed')" type="button" :class="`${closeClass}`" class="btn btn-sm" data-dismiss="modal">{{ closeText }}</button>
                </div>
            </div><!-- /.modal-content -->
        </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->
</template>

<script>
export default {
    props: {
        size: {
            type: String,
            default: 'md'
        },
        className: {
            type: String,
            default: ''
        },
        confirmText: {
            type: String,
            default: 'Okay'
        },
        closeText: {
            type: String,
            default: 'Close'
        },
        confirmClass: {
            type: String,
            default: 'btn-success'
        },
        closeClass: {
            type: String,
            default: 'btn-success'
        },
        showExit:{
            type: Boolean,
            default: true
        },
        showClose: {
            type: Boolean,
            default: true
        },
        showOkay: {
            type: Boolean,
            default: true
        },
        showFooter: {
            type: Boolean,
            default: true
        }
    }
}
</script>

<style lang="scss">
.modal-body {
    img {
        width: 100%;
        padding: 5px;
    }
}

</style>
