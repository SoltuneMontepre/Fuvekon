import React from 'react'

const ThemePreload = () => {
	return (
		<script
			dangerouslySetInnerHTML={{
				__html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme-storage');
                  var theme = 'system';
                  if (stored) {
                    theme = JSON.parse(stored).theme || 'system';
                  }
                  
                  var resolved = theme;
                  if (theme === 'system') {
                    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  
                  if (resolved === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
			}}
		/>
	)
}

export default ThemePreload
