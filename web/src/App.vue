<template>
  <n-config-provider>
    <n-message-provider>
      <div id="app">
        <MainComponent />
      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider, NMessageProvider } from 'naive-ui'
import MainComponent from './components/MainComponent.vue'
import { ref } from 'vue';
import axios from 'axios';
import dayjs from 'dayjs';

console.log('App component loaded')

const date = ref(new Date());
const departure = ref('');
const arrival = ref('');
const timeRange = ref('');
const trainFilter = ref('');

const handleSearch = async () => {
  try {
    // 使用 dayjs 将时间戳转换为 YYYY-MM-DD 格式
    const formattedDate = dayjs(date.value).format('YYYY-MM-DD');
    
    const params = {
      station_start: departure.value,
      station_end: arrival.value,
      date: formattedDate,
      time_range: timeRange.value || '',
      filter_train_name: trainFilter.value || ''
    };

    const queryString = new URLSearchParams(params).toString();
    const response = await axios.get(`/query_any_seat?${queryString}`);
    
    console.log(response.data);
    // ...existing code...
  } catch (error) {
    console.error(error);
    // ...existing code...
  }
};
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}
</style>
