<script>
	(function () {
		Polymer({
			is : 'embedded-media',
			
			properties : [
				{ 
					name : "originalInnerHTML",
					type : String
				},
				{ 
					name : "width",
					type : Number,
					notify : true,
					observer : "widthChanged"
				},
				{ 
					name : "aspect",
					type : Number,
					notify : true,
				}
			],
			
			widthChangedIframe : function() {
				console.log('!! widthChangedIframe');

				var aspect, w, h, bcr = this.$.content.getBoundingClientRect();
				
				if(!(w = this.getAttribute('width')))
					w = this.iframe.width || bcr.width || this.$.content.scrollWidth;
				if(!(h = this.getAttribute('height')))
					h = this.iframe.height || bcr.height || this.$.content.scrollHeight;

				aspect = h / w;

				// set aspect attribute if not yet set
				if(!this.aspect && !(this.aspect = this.getAttribute('aspect')))
				{
					this.aspect = aspect;
					this.setAttribute('aspect', aspect);
				}
				else
					aspect = this.aspect
				
				h = w * aspect;

				this.style.width = this.$.cover.style.width = w + "px";
				this.style.height = this.$.cover.style.height = h + "px";
				//this.$.cover.style.marginTop = "-" + h + "px";

				this.width = this.iframe.width = w;
				this.height = this.iframe.height = h;

				this.iframe.setAttribute('width', w);
				this.iframe.setAttribute('height', h);
			},
			
			// for scripted embeds like Twitter
			widthChangedScript : function(reason) {
				var domMutated = reason == "domMutated";
			
				console.log('!! widthChangedScript');
				var aspect, w, h, bcr = this.$.content.getBoundingClientRect(), maxw, maxh, update;

				if(domMutated || !(w = this.width || this.getAttribute('width')))
					w = bcr.width || this.$.content.scrollWidth;

				h = this.$.content.scrollHeight || bcr.height;
				
				if(!(w && h))
					return;
					
				aspect = h / w;
				
				if(!domMutated)
					this.width || this.getAttribute('width', w);
				
				console.log();

				if(this.maxw && this.maxw < w)
					w = this.maxw;
				if(this.maxh && this.maxh < h)
					h = this.maxh;

				this.updateStyles(w, h);
				
				if(bcr.width < this.$.content.scrollWidth)
				{
					w = this.$.content.scrollWidth;
					h = this.$.content.scrollHeight;
					this.updateStyles(w, h);
				}
				else
				if(reason == 'attributeChanged')
				{
					maxw = Math.max.apply({}, Array.prototype.map.call(this.$.aspectKeeper.childNodes, function(el) { return el.clientWidth || 0 }));
					if(maxw < w) // || maxh < h)
					{
						this.updateStyles(maxw, h);
						w = this.maxw = maxw;
					}
					maxh = Math.max.apply({}, Array.prototype.map.call(this.$.aspectKeeper.childNodes, function(el) { return el.clientHeight || 0 }));
					if(maxh < h) // || maxh < h)
					{
						this.updateStyles(w, maxh);
					}
				}

				//this.updateStyles(w, h);
			},

			updateStyles : function(w, h) {
				this.$.content.style.width = w + "px";
				this.$.content.style.height = h + "px";
				this.style.width = w + "px";
				this.style.height = h + "px";
				
				this.$.cover.style.width = w + "px";
				this.$.cover.style.height = h + "px";
			},

			widthChanged : function(ev) {
				var bcr, domMutated = (ev == true);
		
				if(this.iframe)
					this.widthChangedIframe();
				else
					this.widthChangedScript(ev);
				
				return;
			},
			
			attributeChanged : function(name) {
				if(name == 'width')
					this.widthChanged('attributeChanged');
			},
			
			ready : function() {
				this.originalInnerHTML = this.$.aspectKeeper.innerHTML;
				this.firstAttachment = true;
			},
			
			attached : function() {
				var p = this, firstChild, iframe, w, h, rect, mutationObserver;
				if(!this.firstAttachment)
					return;

				this.firstAttachment = false;
				
				var interval, iframe = Polymer.dom(this).querySelector('iframe');
				this.iframe = Polymer.dom(this).childNodes.length && iframe;
				
				while(p.nodeType == 1 && (p = Polymer.dom(p).parentNode))
					if(p.hasAttribute && p.hasAttribute("contenteditable"))
						this.isInContentEditable = true;
					
				if(this.isInContentEditable)
				{
					this.setAttribute('hasScripts', 'true');
				
					mutationObserver = new MutationObserver(function(mr) {
						this.widthChanged('domMutated');
					}.bind(this));
					
					mutationObserver.observe(this.$.content, {
						childList : true,
						subtree : true
					});
					
					swapScripts(Polymer.dom(this));
					Polymer.dom.flush();
					this.widthChanged();
					
					return;
				}
					
				//this.addEventListener('dom-change', this.domChanged.bind(this));
			},
			
			domChanged : function() {
				console.log('dom changed!')
			}
		})
		
				
		function swapScripts (d) {
			var clone, attrs, pn;
			
			//document.body.appendChild(d);
			
			var s = d.querySelectorAll('script'), i;
			
			for(i = 0; i < s.length; i++)
			{
				clone = document.createElement('script');
				clone.appendChild(document.createTextNode(s[i].textContent));
				attrs = Array.prototype.slice.call(s[i].attributes);
				attrs.forEach(function(a) { if(a.name != 'async') clone.setAttribute(a.name, a.value); });
				
				pn = s[i].parentNode; //Polymer.dom(s[i]).parentNode;
				pn.insertBefore(clone, s[i]);
				pn.removeChild(s[i]);
			}
			
			return s.length;
			//document.body.removeChild(d);
		}
	})();
</script>
