<template>
    <section class="stack-10">
        <h2 class="section-title">Today’s Recommendation</h2>
        <article class="card card-14">
            <div class="row-between">
                <p class="card-heading">优先巡查北区幼苗地块</p>
                <ArrowRight :size="14" class="icon-muted" />
            </div>
            <p class="card-text">建议在今日 15:00 前完成蚜虫热点复查。</p>
            <p class="card-note">数据依据：捕获量 +18%，湿度 82%，风险持续上行。</p>

        </article>
    </section>
</template>

<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next';
</script>

<style scoped>
.card-14 {
    padding: 14px;
    gap: 8px;
}

.stack-10 {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.card-heading {
    margin: 0;
    color: var(--shell-text-strong);
    font-size: 14px;
    font-weight: 500;
}

.card-text {
    margin: 0;
    color: var(--shell-text-body);
    font-size: 13px;
}

.card-note {
    margin: 0;
    color: var(--shell-text-muted);
    font-size: 11px;
}

.row-between {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
</style>