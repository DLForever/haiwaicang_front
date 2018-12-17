<template>
    <div id="app">
    	<transition name="fade" mode="out-in">
    		<router-view></router-view>
    	</transition>
    </div>
</template>
<style>
    @import "../static/css/main.css";
    @import "../static/css/color-dark.css";
    /*@import "../static/css/theme-green/color-green.css";浅绿色主题*/
    .fade-enter{
    	opacity: 0;
    }
    .fade-enter-active{
    	transition: opacity .5s;
    }
    .fade-leave{
    	opacity: 1
    }
    .fade-leave-active{
    	opacity: 0;
    	transition: opacity .5s
    }
</style>