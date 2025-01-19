<template>
  <div class="main-container">
    <!-- Github Link -->
    <div class="github-link">
      <a href="https://github.com/elroy93/12306spy" target="_blank" title="前往github">
        <i class="fab fa-github"></i>
      </a>
    </div>

    <!-- Progress Bar -->
    <n-progress :percentage="100" />

    <!-- Form -->
    <n-form ref="formRef" :model="formData" @submit.prevent="handleSubmit">
      <n-form-item label="出发站" path="station_start">
        <n-input v-model:value="formData.station_start" placeholder="赣榆" @change="setStartToCache" />
      </n-form-item>

      <n-form-item label="目标站" path="station_end">
        <n-input v-model:value="formData.station_end" placeholder="常州" @change="setEndToCache" />
      </n-form-item>

      <n-form-item label="验证日期" path="date">
        <n-date-picker v-model:value="formData.date" type="date" @change="setDateToCache" />
      </n-form-item>

      <n-form-item label="时间范围" path="time_range">
        <n-time-picker v-model:value="formData.timeRange" is-range @change="setTimeRangeToCache" />
      </n-form-item>

      <n-form-item label="车次" path="filter_train_name">
        <n-input v-model:value="formData.filter_train_name" 
                placeholder="选择指定车次,否则查询所有车次直达车票"
                @change="setTrainToCache" />
      </n-form-item>

      <n-form-item>
        <n-space>
          <n-button type="primary" @click="handleSubmit">提交</n-button>
          <n-button @click="handleReset">重置</n-button>
          <n-button @click="handleCleanResult">清空结果</n-button>
          <n-button @click="handleOpenAllLinks">打开所有链接(每次10个)</n-button>
        </n-space>
      </n-form-item>
    </n-form>

    <!-- Results Table -->
    <div v-if="tableData.length">
      <p>{{ tableTitle }}</p>
      <n-data-table
        :columns="columns"
        :data="tableData"
        :pagination="false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import axios from 'axios'
import dayjs from 'dayjs'
import {
  useMessage,
  NButton,
  NForm,
  NFormItem,
  NInput,
  NDatePicker,
  NTimePicker,
  NSpace,
  NProgress,
  NDataTable
} from 'naive-ui'

// 移除 axios 基础 URL 配置
// axios.defaults.baseURL = 'http://localhost:8081'

console.log('MainComponent script executed')

const message = useMessage()
const formData = ref({
  station_start: '',
  station_end: '',
  date: new Date(),
  timeRange: null,
  filter_train_name: ''
})

const tableData = ref([])
const currentOpenLinkIndex = ref(0)
const MAX_OPEN_SIZE = 10

const columns = ref([])
const tableTitle = ref('')

// Cache management functions
const setStartToCache = () => {
  localStorage.setItem('station_start', formData.value.station_start)
}

const setEndToCache = () => {
  localStorage.setItem('station_end', formData.value.station_end)
}

const setDateToCache = () => {
  localStorage.setItem('date', formData.value.date)
}

const setTimeRangeToCache = () => {
  localStorage.setItem('time_range', formData.value.timeRange)
}

const setTrainToCache = () => {
  localStorage.setItem('filter_train_name', formData.value.filter_train_name)
}

// Submit handler
const handleSubmit = async () => {
  try {
    // 使用 dayjs 将日期格式化为 YYYY-MM-DD
    const formattedDate = dayjs(formData.value.date).format('YYYY-MM-DD');
    
    const params = {
      station_start: formData.value.station_start,
      station_end: formData.value.station_end,
      date: formattedDate,
      time_range: formData.value.timeRange || '',
      filter_train_name: formData.value.filter_train_name || ''
    };

    const response = await axios.get('/query_any_seat', { 
      params,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.status === 'success') {
      tableData.value = response.data.data;
      updateColumns();
      message.success('查询成功');
    } else {
      message.error(response.data.data);
    }
  } catch (error) {
    message.error('查询失败: ' + error.message);
  }
}

// Reset form
const handleReset = () => {
  formData.value = {
    station_start: '',
    station_end: '',
    date: new Date(),
    timeRange: null,
    filter_train_name: ''
  }
}

// Clean results
const handleCleanResult = () => {
  tableData.value = []
  tableTitle.value = '查询结果:'
}

// Open all links
const handleOpenAllLinks = () => {
  const maxIndex = Math.min(currentOpenLinkIndex.value + MAX_OPEN_SIZE, tableData.value.length)
  
  if (currentOpenLinkIndex.value >= tableData.value.length) {
    message.info('已经打开所有链接')
    return
  }

  for (let i = currentOpenLinkIndex.value; i < maxIndex; i++) {
    const train = tableData.value[i]
    setTimeout(() => {
      window.open(train.link + `&currenttime=${Date.now()}`, '_blank')
    }, i * 200)
  }
  
  currentOpenLinkIndex.value = maxIndex
}

// Update table columns based on data
const updateColumns = () => {
  if (tableData.value.length === 0) return
  
  const sample = tableData.value[0]
  columns.value = Object.keys(sample).map(key => ({
    title: key,
    key,
    render: (row) => {
      if (key.includes('链接')) {
        return h('a', {
          href: row[key] + `&currenttime=${Date.now()}`,
          target: '_blank'
        }, '点击直达')
      }
      return row[key]
    }
  }))
}

// Load initial data from URL and localStorage
onMounted(() => {
  console.log('MainComponent mounted')
  const urlParams = new URLSearchParams(window.location.search)
  
  formData.value = {
    station_start: urlParams.get('station_start') || localStorage.getItem('station_start') || '',
    station_end: urlParams.get('station_end') || localStorage.getItem('station_end') || '',
    date: urlParams.get('date') || localStorage.getItem('date') || new Date().toISOString().split('T')[0],
    timeRange: urlParams.get('time_range') || localStorage.getItem('time_range') || null,
    filter_train_name: urlParams.get('filter_train_name') || localStorage.getItem('filter_train_name') || ''
  }

  if (urlParams.get('auto_query') === '1') {
    handleSubmit()
  }
})
</script>

<style scoped>
.main-container {
  padding: 20px;
}

.github-link {
  position: fixed;
  top: 20px;
  left: 0;
  z-index: 1000;
}

.github-link a {
  color: #333;
  font-size: 24px;
}

.github-link a:hover {
  color: #0be999;
}
</style>