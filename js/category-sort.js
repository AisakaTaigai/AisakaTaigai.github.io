// 分类页面排序功能
document.addEventListener('DOMContentLoaded', function() {
  const categoryPage = document.getElementById('category');
  if (!categoryPage) return;

  const sortBtns = categoryPage.querySelectorAll('.sort-btn');
  const articleSort = categoryPage.querySelector('.article-sort');
  if (!articleSort) return;

  // 获取所有文章项
  const articles = Array.from(articleSort.querySelectorAll('.article-sort-item:not(.year)'));
  
  // 存储原始顺序
  const originalArticles = [...articles];
  
  // 当前排序状态
  let currentSort = 'date-desc';

  // 为每个排序按钮添加点击事件
  sortBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const sortType = this.id.replace('sort-', '');
      
      // 更新按钮激活状态
      sortBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      // 执行排序
      if (currentSort === sortType) return;
      currentSort = sortType;
      
      performSort(sortType);
    });
  });

  function performSort(sortType) {
    let sortedArticles;
    
    switch(sortType) {
      case 'date-desc':
        // 按时间降序（默认）
        sortedArticles = [...originalArticles].sort((a, b) => {
          const dateA = new Date(a.querySelector('.post-meta-date-created').getAttribute('datetime'));
          const dateB = new Date(b.querySelector('.post-meta-date-created').getAttribute('datetime'));
          return dateB - dateA;
        });
        break;
        
      case 'date-asc':
        // 按时间升序
        sortedArticles = [...originalArticles].sort((a, b) => {
          const dateA = new Date(a.querySelector('.post-meta-date-created').getAttribute('datetime'));
          const dateB = new Date(b.querySelector('.post-meta-date-created').getAttribute('datetime'));
          return dateA - dateB;
        });
        break;
        
      case 'pv-desc':
        // 按浏览量降序
        sortedArticles = sortByPV('desc');
        break;
        
      case 'pv-asc':
        // 按浏览量升序
        sortedArticles = sortByPV('asc');
        break;
        
      default:
        sortedArticles = [...originalArticles];
    }
    
    // 重新排列文章
    reorderArticles(sortedArticles);
  }

  function sortByPV(order) {
    // 获取所有文章的浏览量
    const articlesWithPV = articles.map(article => {
      const pvElement = article.querySelector('.busuanzi-page-pv');
      const pv = pvElement ? parseInt(pvElement.getAttribute('data-pv') || '0') : 0;
      return { article, pv };
    });
    
    // 排序
    articlesWithPV.sort((a, b) => {
      return order === 'desc' ? b.pv - a.pv : a.pv - b.pv;
    });
    
    return articlesWithPV.map(item => item.article);
  }

  function reorderArticles(sortedArticles) {
    // 获取所有年份标题
    const yearHeaders = Array.from(articleSort.querySelectorAll('.article-sort-item.year'));
    
    // 清空文章内容（保留年份标题）
    yearHeaders.forEach(header => header.remove());
    
    // 重新组织文章并按年份分组
    const articlesByYear = {};
    sortedArticles.forEach(article => {
      const timeElement = article.querySelector('.post-meta-date-created');
      if (!timeElement) return;
      
      const datetime = timeElement.getAttribute('datetime');
      const year = new Date(datetime).getFullYear();
      
      if (!articlesByYear[year]) {
        articlesByYear[year] = [];
      }
      articlesByYear[year].push(article);
    });
    
    // 按年份降序排列
    const years = Object.keys(articlesByYear).sort((a, b) => b - a);
    
    // 重新插入到DOM中
    years.forEach(year => {
      // 创建年份标题
      const yearHeader = document.createElement('div');
      yearHeader.className = 'article-sort-item year';
      yearHeader.innerHTML = `<span>${year}</span>`;
      articleSort.appendChild(yearHeader);
      
      // 插入该年份的文章
      articlesByYear[year].forEach(article => {
        articleSort.appendChild(article);
      });
    });
  }

  // 监听busuanzi加载完成，更新浏览量数据
  if (window.busuanziCallback) {
    const originalCallback = window.busuanziCallback;
    window.busuanziCallback = function() {
      originalCallback.apply(this, arguments);
      // 如果当前是按浏览量排序，重新排序
      if (currentSort.startsWith('pv-')) {
        performSort(currentSort);
      }
    };
  }
});
