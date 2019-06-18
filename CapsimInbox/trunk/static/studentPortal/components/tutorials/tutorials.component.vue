<template lang="html">
    <div id="capsim-student-portal-tutorials">
        <h1> Tutorial </h1>
        <div class="panel panel-default" style="padding: 5px 5px;">
            <div class="panel-body">
                <div class="row">
                    <div class="col-md-12">
                        <iframe 
                            id="rehearsal"
                            name="rehearsal" 
                            src="/capsiminbox/rehearsal" 
                            style="width: 100%;height: 900px;border: 1px solid #fff;">
                        </iframe>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'capsim-student-portal-tutorials',
    data: () => ({})
}
</script>
