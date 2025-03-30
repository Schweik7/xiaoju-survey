import { defineComponent, computed, shallowRef, defineAsyncComponent } from 'vue'
import BaseRate from '../BaseRate'
import './style.scss'

export default defineComponent({
  name: 'StarModule',
  props: {
    type: {
      type: String,
      default: ''
    },
    field: {
      type: String,
      default: ''
    },
    value: {
      type: [String, Number],
      default: 0
    },
    starMin: {
      type: Number,
      default: 1
    },
    starMax: {
      type: Number,
      default: 5
    },
    starStyle: {
      type: String,
      default: 'star'
    },
    readonly: {
      type: Boolean,
      default: false
    },
    rangeConfig: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  emits: ['change'],
  setup(props, { emit }) {
    const rating = computed({
      get() {
        return props.value
      },
      set(val) {
        const key = props.field
        emit('change', {
          key,
          value: val
        })
      }
    })
    const currentRangeConfig = computed(() => {
      return props.rangeConfig[rating.value]
    })
    const isShowInput = computed(() => {
      return currentRangeConfig.value?.isShowInput
    })
    const starClass = computed(() => {
      const { starStyle } = props
      switch (starStyle) {
        case 'star':
          return 'qicon qicon-xingxing'
        case 'love':
          return 'qicon qicon-aixin'
        case 'number':
          return 'number'
        default:
          return 'qicon qicon-xingxing'
      }
    })
    const confirmStar = (num) => {
      if (props.readonly) return
      rating.value = num
    }
    const onMoreDataChange = (data) => {
      const { key, value } = data
      emit('change', {
        key,
        value
      })
    }
    const selectMoreView = shallowRef(null)
    if (props.readonly) {
      selectMoreView.value = defineAsyncComponent(
        () => import('@materials/questions/QuestionContainerB')
      )
    } else {
      selectMoreView.value = defineAsyncComponent(
        () => import('@materials/questions/QuestionRuleContainer')
      )
    }
    return {
      rating,
      currentRangeConfig,
      starClass,
      isShowInput,
      confirmStar,
      onMoreDataChange,
      selectMoreView
    }
  },

  // 修改后的 StarModule/index.jsx 中的 render 函数部分，现在可以呈现所有的评分释义文本了
  render() {
    const {
      field,
      value,
      rating,
      readonly,
      starClass,
      currentRangeConfig,
      isShowInput,
      onMoreDataChange,
      rangeConfig,
      selectMoreView,
      confirmStar,
      starMin,
      starMax
    } = this

    // 生成所有评分选项的范围数组
    const ratingRange = []
    for (let i = starMin; i <= starMax; i++) {
      ratingRange.push(i)
    }

    return (
      <div class="star-wrapper-main">
        {/* 显示所有分值对应的释义文本 */}
        <div class="star-ratings-explanation">
          {ratingRange.map(score => (
            <div class={`rating-explain-item ${value == score ? 'active' : ''}`} key={score}>
              {/* <span class="rating-score">{score}</span> */}
              <span class="rating-text">{rangeConfig[score]?.explain || ''}</span>
            </div>
          ))}
        </div>
        <BaseRate
          name={field}
          value={value}
          readonly={readonly}
          iconClass={starClass}
          onChange={confirmStar}
        />



        {/* 保留原有的功能：当选择一个分值时，显示对应的释义文本 */}
        {currentRangeConfig && <p class="explain radio-star">{currentRangeConfig.explain}</p>}

        {isShowInput && (
          <selectMoreView
            showTitle={false}
            key={`${field}_${rating}`}
            moduleConfig={{
              type: 'selectMoreModule',
              field: `${field}_${rating}`,
              placeholder: rangeConfig[rating]?.text,
              value: rangeConfig[rating]?.othersValue || ''
            }}
            onChange={(e) => onMoreDataChange(e)}
          ></selectMoreView>
        )}
      </div>
    )
  }
})
