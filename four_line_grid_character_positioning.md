# 四线格字符定位标准实现

## 实现的字符定位规则

### 1. 大写字母 (A-Z)
- **占用区域**: 上区域 + 中区域
- **定位**: 上中区域的中心偏上 (y + sectionHeight * 0.9)
- **字母**: A B C D E F G H I J K L M N O P Q R S T U V W X Y Z

### 2. 小写字母 - 上延字母 (bdhiklt)
- **占用区域**: 上区域 + 中区域
- **定位**: 上中区域的中心偏上 (y + sectionHeight * 0.9)
- **字母**: b d h i k l t

### 3. 小写字母 - 全高字母 (fj)
- **占用区域**: 上区域 + 中区域 + 下区域
- **定位**: 三个区域的中心 (y + height / 2)
- **字母**: f j

### 4. 小写字母 - 下延字母 (pqy)
- **占用区域**: 中区域 + 下区域
- **定位**: 中区域的中心，允许下延部分延伸到下区域
- **字母**: p q y

### 5. 小写字母 - 轻微下延字母 (g)
- **占用区域**: 中区域 + 下区域
- **定位**: 中区域的中心，允许下延部分延伸到下区域
- **字母**: g

### 6. 小写字母 - 标准字母 (其他)
- **占用区域**: 中区域
- **定位**: 中区域的中心
- **字母**: a c e m n o r s u v w x z

## 测试用例

### 大写字母测试
`ABCDEFGHIJKLMNOPQRSTUVWXYZ`

### 小写字母测试
`abcdefghijklmnopqrstuvwxyz`

### 混合测试
`Hello World`
`Big Fish`
`Happy Days`
`Quick Jump`

### 特殊字符测试
- 上延字母: `bdhiklt`
- 全高字母: `fj`
- 下延字母: `pqy`
- 轻微下延: `g`

## 技术实现

```javascript
function calculateCharacterPositionInFourLineGrid(character: string, y: number, height: number): number {
  const sectionHeight = height / 3;
  
  // 大写字母和上延小写字母
  if (character >= 'A' && character <= 'Z' || 'bdhiklt'.includes(character)) {
    return y + sectionHeight * 0.9;
  }
  
  // 全高字母
  if ('fj'.includes(character)) {
    return y + (height / 2);
  }
  
  // 下延字母
  if ('pqyg'.includes(character)) {
    return y + sectionHeight + (sectionHeight / 2);
  }
  
  // 标准小写字母
  return y + sectionHeight + (sectionHeight / 2);
}
```

## 预期效果

1. **大写字母**: 高度占用上两个区域，垂直居中略偏上
2. **小写字母**: 根据字母特点正确定位
3. **整体美观**: 符合英文书写习惯和视觉美感
4. **易读性**: 字符在正确位置，便于书写练习

## 状态

- ✅ 大写字母定位
- ✅ 小写字母上延字母定位
- ✅ 小写字母全高字母定位
- ✅ 小写字母下延字母定位
- ✅ 标准小写字母定位