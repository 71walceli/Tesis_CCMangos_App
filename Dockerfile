FROM ubuntu:22.04

# Installing chrome and its deps
RUN dpkg --add-architecture 'i386'
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update
RUN apt-get install -y xorg sudo git curl qemu qemu-kvm libvirt-daemon-system libvirt-clients bridge-utils libc6:i386 libncurses5:i386 libstdc++6:i386 lib32z1 libbz2-1.0:i386
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ARG UID=1000
ARG GID=1000
ARG USER=AndroidStudio

RUN groupadd -g ${GID} ${USER}
RUN useradd ${USER} -u ${UID} -g ${GID} -m -s /bin/bash
RUN chown -R ${UID}:${GID} /home/${USER}
RUN adduser ${USER} libvirt
RUN adduser ${USER} kvm
RUN echo "${USER}:${USER}" | chpasswd
# Make sudo passwordless
RUN echo "${USER} ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/90-${USER}
RUN usermod -aG sudo ${USER}
RUN usermod -aG plugdev ${USER}

WORKDIR /App
ARG ANDROID_STUDIO_URL="https://r3---sn-pm2-btxd.gvt1.com/edgedl/android/studio/ide-zips/2022.3.1.18/android-studio-2022.3.1.18-linux.tar.gz"
RUN curl -L ${ANDROID_STUDIO_URL} -o ~/android-studio.tar.gz
RUN tar -xvzf ~/android-studio.tar.gz
RUN rm ~/android-studio.tar.gz

WORKDIR /home/${USER}
USER ${USER}
WORKDIR /home/${USER}
RUN git clone https://github.com/shyiko/jabba ~/jabba
RUN ~/jabba/install.sh 
RUN ~/.jabba/bin/jabba install openjdk@1.11.0

ENV DISPLAY :0
ENV ANDROID_HOME ~/Android/Sdk
ENV PATH ~/Android/Sdk/platform-tools:/App/android-studio/bin:${PATH}
RUN echo ${PATH}
ENV USER ${USER}
#ENTRYPOINT "/App/android-studio/bin/studio.sh"

USER root
RUN apt-get update; apt-get install curl gpg -y; \
mkdir -p /etc/apt/keyrings; \
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg; \
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list; \
 apt-get update && apt-get install -y nodejs;

RUN npm install -g yarn

USER ${USER}
ENV PATH /App/android-studio/jbr/bin:${PATH}
